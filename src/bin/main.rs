use game_of_tag::Universe;

fn main() {
    println!("Game of Tag!");

    let mut universe = example();
    universe.tick();

    // Parseable array or arrays
    // TODO: output as JSON
    println!("Universe\n{}", universe);
    println!("Universe: Debug\n{:?}", universe);
}

fn example() -> Universe {
    let mut universe = Universe::new();
    universe.set_width(6);
    universe.set_height(6);
    universe.set_cells(&[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)]);
    universe.set_tagged_cell(2, 3);
    universe
}
