extern crate cfg_if;
extern crate wasm_bindgen;
extern crate web_sys;

mod utils;

use oorandom;
use std::fmt;
use wasm_bindgen::prelude::*;
use web_sys::console;

pub struct Timer<'a> {
    name: &'a str,
}

impl<'a> Timer<'a> {
    pub fn new(name: &'a str) -> Timer<'a> {
        console::time_with_label(name);
        Timer { name }
    }
}

impl<'a> Drop for Timer<'a> {
    fn drop(&mut self) {
        console::time_end_with_label(self.name);
    }
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Empty = 0,
    Active = 1,
    IsTagged = 2,
    WasTagged = 3,
}

impl Cell {
    fn toggle(&mut self) {
        *self = match *self {
            Cell::Active => Cell::IsTagged,
            Cell::IsTagged => Cell::WasTagged,
            Cell::WasTagged => Cell::Active,
            _ => *self,
        };
    }
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}

impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    /// Get the Cell values of the entire universe.
    pub fn get_cells(&self) -> &[Cell] {
        &self.cells
    }

    /// Set cells to be Active in a universe by passing the row and column
    /// of each cell as an array.
    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
            self.cells[idx] = Cell::Active;
        }
    }

    // Positions of the Cells surrounding the Agent
    fn observe(&self, row: u32, column: u32) -> [(u32, u32); 8] {
        // wrap around
        let north = if row == 0 { self.height - 1 } else { row - 1 };
        let south = if row == self.height - 1 { 0 } else { row + 1 };
        let west = if column == 0 {
            self.width - 1
        } else {
            column - 1
        };
        let east = if column == self.width - 1 {
            0
        } else {
            column + 1
        };

        // available co-ordinates
        let nw = (north, west);
        let n = (north, column);
        let ne = (north, east);
        let w = (row, west);
        let e = (row, east);
        let sw = (south, west);
        let s = (south, column);
        let se = (south, east);

        [nw, n, ne, e, se, s, sw, w]
    }

    fn travel(&self, agent: (u32, u32), neighbours: [(u32, u32); 8]) -> (u32, u32) {
        let mut next = Vec::new();

        for &(row, col) in neighbours.iter() {
            let cid = self.get_index(row, col);

            // TODO: check other neighbour states
            if self.cells[cid] == Cell::Empty {
                next.push((row, col));
            }
        }

        // Choose a rand Empty Cell (if there are any)
        // TODO: add a policy depending on agent state, agression, etc
        let mut rng = oorandom::Rand32::new(1);
        match next.len() {
            0 => agent, // don't move
            l => {
                let i = rng.rand_range(0..l as u32) as usize;
                next[i]
            }
        }
    }
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Universe {
    pub fn tick(&mut self) {
        // NOTE: enabling Timer forces use of 'wasm-pack test'
        // let _timer = Timer::new("Universe::tick");

        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                // Observe
                let neighbours = self.observe(row, col);

                // Move
                let start = self.get_index(row, col);
                let (row, col) = self.travel((row, col), neighbours);
                let dest = self.get_index(row, col);
                next.swap(start, dest);

                // Act
                let aid = self.get_index(row, col);
                // Rule 1: If previously tagged, recover after 1 timestep
                if next[aid] == Cell::WasTagged {
                    next[aid].toggle();
                }

                let neighbours = self.observe(row, col);
                for &(row, col) in neighbours.iter() {
                    let cid = self.get_index(row, col);
                    // Rule 2: For the first neighbour in range make them 'it'
                    // Rule 3: Unless they were just 'it'
                    // Rule 4: Protect from tag-backs
                    if next[aid] == Cell::IsTagged && next[cid] == Cell::Active {
                        next[cid].toggle();
                        next[aid].toggle();
                    }
                }
            }
        }

        self.cells = next;
    }

    pub fn new() -> Universe {
        utils::set_panic_hook();

        let width = 128;
        let height = 128;

        let cells: Vec<Cell> = (0..width * height)
            .map(|i| {
                if i % 8 == 0 || i % 7 == 0 {
                    Cell::Active
                } else {
                    Cell::Empty
                }
            })
            .collect();

        let mut universe = Universe {
            width,
            height,
            cells,
        };

        // Set a random Cell as 'it'
        let mut rng = oorandom::Rand32::new(1);
        let row = rng.rand_range(0..height);
        let col = rng.rand_range(0..width);
        universe.set_tagged_cell(row, col);

        universe
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    // Set the width of the universe.
    // Resets all cells to the Empty state.
    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        self.cells = (0..width * self.height).map(|_i| Cell::Empty).collect();
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    // Set the height of the universe.
    // Resets all cells to the Empty state.
    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        self.cells = (0..self.width * height).map(|_i| Cell::Empty).collect();
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let idx = self.get_index(row, column);
        self.cells[idx].toggle();
    }

    // Set a cell to be 'it'
    pub fn set_tagged_cell(&mut self, row: u32, column: u32) {
        let idx = self.get_index(row, column);
        self.cells[idx] = Cell::IsTagged;
    }
}

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[\n")?;
        for line in self.cells.as_slice().chunks(self.width as usize) {
            write!(f, "  {:?},\n", line)?;
        }
        write!(f, "]\n")?;
        Ok(())
    }
}

impl fmt::Debug for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = match cell {
                    Cell::Empty => '◻',
                    Cell::Active => '◼',
                    Cell::IsTagged => '*',
                    Cell::WasTagged => '!',
                };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}

// Include unit tests in a siblings file
#[cfg(test)]
mod lib_tests;
