import {Universe, Cell} from 'wasm-game-of-tag';
import {memory} from 'wasm-game-of-tag/game_of_tag_bg';
import {drawGrid, drawCells} from './src/draw.js';
import Fps from './src/fps.js';

const CELL_SIZE = 5; // px

// Construct the universe, and get its width and height.
const universe = Universe.new();
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById('game-of-tag-canvas');
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;
const ctx = canvas.getContext('2d');

const playPauseButton = document.getElementById('play-pause');
const fps = new Fps({el: document.getElementById('fps')});

let animationId = null;

const renderLoop = () => {
  fps.render();

  drawGrid({ctx, universe, CELL_SIZE});
  drawCells({ctx, universe, CELL_SIZE, memory, Cell});

  for (let i = 0; i < 9; i++) {
    universe.tick();
  }

  animationId = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
  return animationId === null;
};
const play = () => {
  playPauseButton.textContent = '⏸';
  renderLoop();
};
const pause = () => {
  playPauseButton.textContent = '▶';
  cancelAnimationFrame(animationId);
  animationId = null;
};
playPauseButton.addEventListener('click', (event) => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

canvas.addEventListener('click', (event) => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.toggle_cell(row, col);

  drawCells({ctx, universe, memory, CELL_SIZE, Cell});
  drawGrid({ctx, universe, CELL_SIZE});
});

play();
