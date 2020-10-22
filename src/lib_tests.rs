// Unit tests in submodules can access private members
// Call in parent module using:
// #[cfg(test)]
// mod lib_tests;

// Note this useful idiom: importing names from outer (for mod tests) scope.
use super::*;

#[test]
pub fn test_tick() {
    // Let's create a smaller Universe with a small space to test!
    let mut input_universe = Universe::new();
    // let mut input_universe = input_space();
    println!("Universe\n{}", input_universe);

    // This is what our space should look like
    // after one tick in our universe.
    // let expected_universe = expected_space();

    //// Call `tick` and then see if the cells in the `Universe`s are the same.
    input_universe.tick();

    println!("Universe\n{}", input_universe);
    assert_eq!((128 * 128), input_universe.get_cells().len());
    // assert_eq!(&input_universe.get_cells(), &expected_universe.get_cells());
}

#[cfg(test)]
pub fn input_space() -> Universe {
    let mut universe = Universe::new();
    universe.set_width(6);
    universe.set_height(6);
    universe.set_cells(&[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)]);
    universe
}

#[cfg(test)]
pub fn expected_space() -> Universe {
    let mut universe = Universe::new();
    universe.set_width(6);
    universe.set_height(6);
    universe.set_cells(&[(2, 1), (2, 3), (3, 2), (3, 3), (4, 2)]);
    universe
}
