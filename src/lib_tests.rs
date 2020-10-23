// Unit tests in submodules can access private members
// Call in parent module using:
// #[cfg(test)]
// mod lib_tests;

// Note this useful idiom: importing names from outer (for mod tests) scope.
use super::*;

#[test]
pub fn test_tick() {
    // Let's create a smaller Universe with a small space to test!
    // let mut input_universe = Universe::new();
    let mut universe = input();
    println!("Universe: Input\n{}", universe);

    // This is what our space should look like after one tick in our universe.
    let expected = expected();

    //// Call `tick` and then see if the cells in the `Universe`s are the same.
    universe.tick();

    println!("Universe: Expected\n{:?}", expected);
    println!("Universe: Actual\n{:?}", universe);
    assert_eq!((6 * 6), universe.get_cells().len());
    assert_eq!(&universe.get_cells(), &expected.get_cells());
}

#[cfg(test)]
pub fn input() -> Universe {
    let mut universe = Universe::new();
    universe.set_width(6);
    universe.set_height(6);
    universe.set_cells(&[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)]);
    universe.set_tagged_cell(2, 3);
    universe
}

#[cfg(test)]
pub fn expected() -> Universe {
    let mut universe = Universe::new();
    universe.set_width(6);
    universe.set_height(6);
    universe.set_cells(&[(0, 3), (1, 5), (2, 2), (3, 0), (5, 3)]);
    universe.set_tagged_cell(0, 3);
    universe.toggle_cell(5, 3);
    universe.toggle_cell(5, 3);
    universe
}
