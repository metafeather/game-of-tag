(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var wasm_game_of_tag__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! wasm-game-of-tag */ \"../../../../../tmp/node_modules/wasm-game-of-tag/game_of_tag.js\");\n/* harmony import */ var wasm_game_of_tag_game_of_tag_bg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! wasm-game-of-tag/game_of_tag_bg */ \"../../../../../tmp/node_modules/wasm-game-of-tag/game_of_tag_bg.wasm\");\n/* harmony import */ var _src_draw_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/draw.js */ \"./src/draw.js\");\n/* harmony import */ var _src_fps_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/fps.js */ \"./src/fps.js\");\n\n\n\n\n\nconst CELL_SIZE = 5; // px\n\n// Construct the universe, and get its width and height.\nconst universe = wasm_game_of_tag__WEBPACK_IMPORTED_MODULE_0__[\"Universe\"].new();\nconst width = universe.width();\nconst height = universe.height();\n\n// Give the canvas room for all of our cells and a 1px border\n// around each of them.\nconst canvas = document.getElementById('game-of-tag-canvas');\ncanvas.height = (CELL_SIZE + 1) * height + 1;\ncanvas.width = (CELL_SIZE + 1) * width + 1;\nconst ctx = canvas.getContext('2d');\n\nconst playPauseButton = document.getElementById('play-pause');\nconst stepButton = document.getElementById('step');\nconst locationOutput = document.getElementById('locationOutput');\nconst fps = new _src_fps_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"]({el: document.getElementById('fps')});\n\nlet animationId = null;\n\nconst renderLoop = () => {\n  fps.render();\n\n  Object(_src_draw_js__WEBPACK_IMPORTED_MODULE_2__[\"drawGrid\"])({ctx, universe, CELL_SIZE});\n  Object(_src_draw_js__WEBPACK_IMPORTED_MODULE_2__[\"drawCells\"])({ctx, universe, CELL_SIZE, memory: wasm_game_of_tag_game_of_tag_bg__WEBPACK_IMPORTED_MODULE_1__[\"memory\"], Cell: wasm_game_of_tag__WEBPACK_IMPORTED_MODULE_0__[\"Cell\"], el: locationOutput});\n\n  for (let i = 0; i < 9; i++) {\n    universe.tick();\n  }\n\n  animationId = requestAnimationFrame(renderLoop);\n};\n\nconst isPaused = () => {\n  return animationId === null;\n};\nconst play = () => {\n  playPauseButton.textContent = '⏸️';\n  renderLoop();\n};\nconst pause = () => {\n  playPauseButton.textContent = '⏯';\n  cancelAnimationFrame(animationId);\n  animationId = null;\n};\nplayPauseButton.addEventListener('click', (event) => {\n  if (isPaused()) {\n    play();\n  } else {\n    pause();\n  }\n});\nstepButton.addEventListener('click', (event) => {\n  pause();\n  play();\n  pause();\n});\n\ncanvas.addEventListener('click', (event) => {\n  const boundingRect = canvas.getBoundingClientRect();\n\n  const scaleX = canvas.width / boundingRect.width;\n  const scaleY = canvas.height / boundingRect.height;\n\n  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;\n  const canvasTop = (event.clientY - boundingRect.top) * scaleY;\n\n  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);\n  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);\n\n  universe.toggle_cell(row, col);\n\n  Object(_src_draw_js__WEBPACK_IMPORTED_MODULE_2__[\"drawCells\"])({ctx, universe, memory: wasm_game_of_tag_game_of_tag_bg__WEBPACK_IMPORTED_MODULE_1__[\"memory\"], CELL_SIZE, Cell: wasm_game_of_tag__WEBPACK_IMPORTED_MODULE_0__[\"Cell\"]});\n  Object(_src_draw_js__WEBPACK_IMPORTED_MODULE_2__[\"drawGrid\"])({ctx, universe, CELL_SIZE});\n});\n\nplay();\n\n\n//# sourceURL=webpack:///./index.js?");

/***/ }),

/***/ "./src/draw.js":
/*!*********************!*\
  !*** ./src/draw.js ***!
  \*********************/
/*! exports provided: getIndex, drawGrid, drawCells */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getIndex\", function() { return getIndex; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"drawGrid\", function() { return drawGrid; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"drawCells\", function() { return drawCells; });\nconst GRID_COLOR = '#ccc';\nconst EMPTY_COLOR = '#fff';\nconst ACTIVE_COLOR = '#787878';\nconst ISTAGGED_COLOR = '#f00';\nconst WASTAGGED_COLOR = '#7a1ce6';\n\nconst getIndex = (row, column, {width}) => {\n  return row * width + column;\n};\n\nconst drawGrid = ({ctx, universe, CELL_SIZE}) => {\n  const width = universe.width();\n  const height = universe.height();\n\n  ctx.beginPath();\n  ctx.strokeStyle = GRID_COLOR;\n\n  // Vertical lines.\n  for (let i = 0; i <= width; i++) {\n    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);\n    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);\n  }\n\n  // Horizontal lines.\n  for (let j = 0; j <= height; j++) {\n    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);\n    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);\n  }\n\n  ctx.stroke();\n};\n\nconst drawCells = ({ctx, universe, CELL_SIZE, memory, Cell, el}) => {\n  const width = universe.width();\n  const height = universe.height();\n\n  const cellsPtr = universe.cells();\n  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);\n\n  ctx.beginPath();\n\n  // IsTagged cells.\n  ctx.fillStyle = ISTAGGED_COLOR;\n  for (let row = 0; row < height; row++) {\n    for (let col = 0; col < width; col++) {\n      const idx = getIndex(row, col, {width, height});\n      if (cells[idx] !== Cell.IsTagged) {\n        continue;\n      }\n\n      ctx.fillRect(\n        col * (CELL_SIZE + 1) + 1,\n        row * (CELL_SIZE + 1) + 1,\n        CELL_SIZE,\n        CELL_SIZE\n      );\n\n      // Display location of Tagged Cell\n      el.value = `(${row + 1}, ${col + 1})`;\n    }\n  }\n\n  // WasTagged cells.\n  ctx.fillStyle = WASTAGGED_COLOR;\n  for (let row = 0; row < height; row++) {\n    for (let col = 0; col < width; col++) {\n      const idx = getIndex(row, col, {width, height});\n      if (cells[idx] !== Cell.WasTagged) {\n        continue;\n      }\n\n      ctx.fillRect(\n        col * (CELL_SIZE + 1) + 1,\n        row * (CELL_SIZE + 1) + 1,\n        CELL_SIZE,\n        CELL_SIZE\n      );\n    }\n  }\n\n  // Active cells.\n  ctx.fillStyle = ACTIVE_COLOR;\n  for (let row = 0; row < height; row++) {\n    for (let col = 0; col < width; col++) {\n      const idx = getIndex(row, col, {width, height});\n      if (cells[idx] !== Cell.Active) {\n        continue;\n      }\n\n      ctx.fillRect(\n        col * (CELL_SIZE + 1) + 1,\n        row * (CELL_SIZE + 1) + 1,\n        CELL_SIZE,\n        CELL_SIZE\n      );\n    }\n  }\n\n  // Empty cells.\n  ctx.fillStyle = EMPTY_COLOR;\n  for (let row = 0; row < height; row++) {\n    for (let col = 0; col < width; col++) {\n      const idx = getIndex(row, col, {width, height});\n      if (cells[idx] !== Cell.Empty) {\n        continue;\n      }\n\n      ctx.fillRect(\n        col * (CELL_SIZE + 1) + 1,\n        row * (CELL_SIZE + 1) + 1,\n        CELL_SIZE,\n        CELL_SIZE\n      );\n    }\n  }\n\n  ctx.stroke();\n};\n\n\n//# sourceURL=webpack:///./src/draw.js?");

/***/ }),

/***/ "./src/fps.js":
/*!********************!*\
  !*** ./src/fps.js ***!
  \********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (class {\n  constructor({el}) {\n    this.fps = el;\n    this.frames = [];\n    this.lastFrameTimeStamp = performance.now();\n  }\n\n  render() {\n    // Convert the delta time since the last frame render into a measure\n    // of frames per second.\n    const now = performance.now();\n    const delta = now - this.lastFrameTimeStamp;\n    this.lastFrameTimeStamp = now;\n    const fps = (1 / delta) * 1000;\n\n    // Save only the latest 100 timings.\n    this.frames.push(fps);\n    if (this.frames.length > 100) {\n      this.frames.shift();\n    }\n\n    // Find the max, min, and mean of our 100 latest timings.\n    let min = Infinity;\n    let max = -Infinity;\n    let sum = 0;\n    for (let i = 0; i < this.frames.length; i++) {\n      sum += this.frames[i];\n      min = Math.min(this.frames[i], min);\n      max = Math.max(this.frames[i], max);\n    }\n    let mean = sum / this.frames.length;\n\n    // Render the statistics.\n    this.fps.value = `\nFrames per Second: latest = ${Math.round(\n      fps\n    )} avg/min/max of last 100 ${Math.round(mean)} / ${Math.round(\n      min\n    )} / ${Math.round(max)}\n  `.trim();\n  }\n});\n\n\n//# sourceURL=webpack:///./src/fps.js?");

/***/ })

}]);