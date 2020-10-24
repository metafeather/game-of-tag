const GRID_COLOR = '#ccc';
const EMPTY_COLOR = '#fff';
const ACTIVE_COLOR = '#787878';
const ISTAGGED_COLOR = '#f00';
const WASTAGGED_COLOR = '#0f0';

export const getIndex = (row, column, {width}) => {
  return row * width + column;
};

export const drawGrid = ({ctx, universe, CELL_SIZE}) => {
  const width = universe.width();
  const height = universe.height();

  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

export const drawCells = ({ctx, universe, CELL_SIZE, memory, Cell, el}) => {
  const width = universe.width();
  const height = universe.height();

  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  // IsTagged cells.
  ctx.fillStyle = ISTAGGED_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col, {width, height});
      if (cells[idx] !== Cell.IsTagged) {
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );

      // Display location of Tagged Cell
      el.value = `(${row + 1}, ${col + 1})`;
    }
  }

  // WasTagged cells.
  ctx.fillStyle = WASTAGGED_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col, {width, height});
      if (cells[idx] !== Cell.WasTagged) {
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  // Active cells.
  ctx.fillStyle = ACTIVE_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col, {width, height});
      if (cells[idx] !== Cell.Active) {
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  // Empty cells.
  ctx.fillStyle = EMPTY_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col, {width, height});
      if (cells[idx] !== Cell.Empty) {
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};
