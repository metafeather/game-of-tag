use game_of_tag::Universe;

fn main() {
    println!("Hello Game of Tag!");

    let universe = example_space();    
    println!("Universe");
    println!("{}", universe);
}

fn example_space() -> Universe {
    let mut universe = Universe::new();
    universe.set_width(6);
    universe.set_height(6);
    universe.set_cells(&[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)]);
    universe
}