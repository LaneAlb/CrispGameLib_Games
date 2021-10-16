title = "Flipper";

description = `
[Tap] Flip Tile
Match the image shown!
`;

characters = [
`
llllll
llllll
llllll
llllll
llllll
llllll
`,
`
cccccc
cccccc
cccccc
cccccc
cccccc
cccccc
`
];

// Game and Runtime Options
const G = {
  WIDTH: 200,
  HEIGHT: 200,
  Box_Width: 50,
  RESETS: 3,
  LEVELS: 4,
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  isReplayEnabled:true,
  isPlayingBgm: true,
  seed: 25,
  theme: "shapeDark",
  isDrawingParticleFront: true
};
/**
 * @typedef  { object } Block  - The Typescript object
 * @property { Vector } pos    - Position defined by Vector
 * @property { Number } width  - Width of the Block
 * @property { Boolean } lit   - Color Index of the block
 */ 

/**
 * @type { Block [] }
 */
let row1, row2, row3; // Pos and width
let tiles;
let cursor;
let clicked;
let level; // random integer
let lights1, lights2, lights3;
let resets;
// curerntly lit array (just to keep easy tracking)
let currentlyLit = [
  [0, 0, 0], 
  [0, 0, 0], 
  [0, 0, 0]
]
// Solution Array
// 0 0 0
// 0 0 0
// 0 0 0
let problems = [ 
  [ [0, 1, 0],
    [1, 1, 1], // CROSS
    [0, 1, 0],
  ],
  [ [1, 0, 1],
    [1, 1, 1], // letter H
    [1, 0, 1]
  ],
  [ [1, 1, 1],
    [0, 1, 0], // letter T
    [0, 1, 0]
  ],
  [ [1, 1, 1],
    [1, 0, 1], // border
    [1, 1, 1]
  ],
];

function update() {
  if (!ticks) {
    level = 0;
    resets = G.RESETS;
    // RECT's have pos relative to upper left corner
    // SOOOO
    // to "center" 3 rects we take 
    // X === boxWidth * offset + (value to "center" the blocks as a row)
    // Y === relative to center is just playing with values to get a nice offset
    // in our case 1.5 to get row1, + or - 0.5 for row2 and row3
    // below math has 0.4 and 0.7 for row2 and row3 to give a space in between tiles
    row1 = times(3, (i) =>{
      var mod = (i % 3); // 1
      var X = ( G.Box_Width * (mod*1.1) ) + G.Box_Width*0.4;
      var Y = G.HEIGHT*0.5 - G.Box_Width*1.5;
      return { pos: vec(X, Y), width: G.Box_Width, lit: false };
    });
    row2 = times(3, (i) =>{
      var mod = (i % 3);
      var X = (G.Box_Width* (mod*1.1)) + G.Box_Width*0.4;
      var Y = G.HEIGHT*0.5 - G.Box_Width*0.4;
      return { pos: vec(X, Y), width: G.Box_Width, lit: false };
    });
    row3 = times(3, (i) =>{
      var mod = (i % 3);
      var X = (G.Box_Width* (mod*1.1)) + G.Box_Width*0.4;
      var Y = G.HEIGHT*0.5 + G.Box_Width*0.7;
      return { pos: vec(X, Y), width: G.Box_Width, lit: false };
    });
    tiles = [ row1, row2, row3 ];
    cursor = {pos: vec(G.WIDTH*0.5, G.HEIGHT*0.5)};
    // create click checking arrow and push defaulted values for debugging
    clicked = [];
    clicked.push(-1);
    clicked.push(-1);
  } // end init()

  tiles.forEach( (row) =>{
    row.forEach((block) => {
      if(!block.lit){
        color("black");
        rect(block.pos, block.width, block.width);
      } else {
        color("cyan");
        rect(block.pos, block.width, block.width);
      }
    });
  });

  // draw reset button and button text
  if(resets > 0){
    color("light_purple");
    rect(80, 3, 40, 15);
    color("black");
    text("RESET", 88, 10);
  } else {
    color("light_red");
    rect(80, 3, 40, 15);
    color("black");
    text("GIVEUP", 85, 10);
  }

  // end condition here
  lights1 = currentlyLit[0].every((val, index) => val === problems[level][0][index]);
  lights2 = currentlyLit[1].every((val, index) => val === problems[level][1][index]);
  lights3 = currentlyLit[2].every((val, index) => val === problems[level][2][index]);
  if(lights1 && lights2 && lights3){ 
    level++;
    addScore(10);
    if(level >= G.LEVELS){
      color("white");
      rect(0, 0, G.WIDTH, G.HEIGHT);
      end("Congratz!");
    }
  }

  if(level < G.LEVELS){
    problems[level].forEach( (row, index) => {
      row.forEach((val, ind) => { 
        if(val === 0){
          color("black");
          rect(35 + 6*ind, 5 + index*5, 6, 6);
        } else {
          color("light_cyan");
          rect(35 + 6*ind, 5 + index*5, 6, 6);
        }
      });
    });
  }

  // track player pointer and clamp to game
  cursor.pos = vec(input.pos.x, input.pos.y);
  cursor.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  color("red");
  box(cursor.pos, 2);
  
  if(input.isJustPressed && ( box(cursor.pos, 2).isColliding.rect.black || box(cursor.pos, 2).isColliding.rect.cyan ) ){
    // hard index the adjacent blocks
    findBlock(input.pos);
    //console.log(tiles[clicked[0]][clicked[1]].pos);
    let currBlock = tiles[clicked[0]][clicked[1]];
    currBlock.lit = !currBlock.lit;
    // update the currenlyLit array and light adjacent blocks
    updateCurrent(clicked[0], clicked[1], currBlock.lit);
    lightAdjacent(clicked[0], clicked[1]);
    //create particles
    color("light_blue")
    particle (
      cursor.pos.x,
      cursor.pos.y,
      rnd (15 , 35),
      rnd (2, 3),
      0,
      2 * PI
    )
  }

  // reset button (reset the blocks)
  if(input.isJustPressed && (box(cursor.pos, 2).isColliding.rect.light_purple || box(cursor.pos, 2).isColliding.rect.light_red )){
    color("purple")
    particle (
      cursor.pos.x,
      cursor.pos.y,
      6,
      1.6,
      PI/2,
      PI
    )
    tiles.forEach( (row) =>{
      row.forEach((block) => {
        block.lit = false;
        color("black");
        rect(block.pos, block.width, block.width);
      });
    });
    // RESET CURRENTLY LIT
    currentlyLit[0].forEach((val, index) => {currentlyLit[0][index] = 0;});
    currentlyLit[1].forEach((val, index) => {currentlyLit[1][index] = 0;});
    currentlyLit[2].forEach((val, index) => {currentlyLit[2][index] = 0;});
    --resets;
    if(resets < 0){
      color("white");
      rect(0, 0, G.WIDTH, G.HEIGHT);
      end("You Gave Up");
    }
  }
}
// find adjacent blocks and light or unlight them
function lightAdjacent(x, y){
   let xMin = x - 1;
   let xMax = x + 1;
   let yMin = y - 1;
   let yMax = y + 1;
   if(xMin >= 0) { 
    tiles[xMin][y].lit = !tiles[xMin][y].lit;
    updateCurrent(xMin, y, tiles[xMin][y].lit);
  }
   if(xMax <= 2) { 
    tiles[xMax][y].lit = !tiles[xMax][y].lit; 
    updateCurrent(xMax, y, tiles[xMax][y].lit);
  }
   if(yMin >= 0) { 
    tiles[x][yMin].lit = !tiles[x][yMin].lit; 
    updateCurrent(x, yMin, tiles[x][yMin].lit);
  }
   if(yMax <= 2) { 
    tiles[x][yMax].lit = !tiles[x][yMax].lit; 
    updateCurrent(x, yMax, tiles[x][yMax].lit);
  }
}

// update the current light array to check against solutions
// status is the current LIGHT state of the block, index is which block
function updateCurrent(col, row, status){
  if(status) currentlyLit[col][row] = 1;
  else currentlyLit[col][row] = 0;
}
// according to console.log in Init
// COLUMN 1 === x: 20  to x: 20  + box.width ===> 70 with box width == 50
// COLUMN 2 === x: 75  to x: 75  + box.width
// COLUMN 3 === x: 130 to x: 130 + box.width
// ROW 1 === y: 25  to y: 25  + box.width    ===> 75 with box width == 50
// ROW 2 === y: 80  to y: 80  + box.width
// ROW 3 === y: 135 to y: 135 + box.width
// *tiles[0][0] IS Col1 Row1 a.k.a top left block
function findBlock(pointer){
  // push the correct col
  if(pointer.x <= 70) {
    clicked[1] = 0;
  } else if (pointer.x >= 130) {
    clicked[1] = 2;  }
  else { 
    clicked[1] = 1;  }
  // push the correct row
  if(pointer.y <= 75) {
    clicked[0] = 0;  }
  else if (pointer.y >= 135) {
    clicked[0] = 2;  }
  else { 
    clicked[0] = 1;  }
}

/*
  CURRENT END GAME IDEA:
    have 2 arrays; first -> "current" is the currently lit blocks lights on denoted by a 1
    2nd -> "problems" is an array of "arrays" which hold each solution that we want in the same manner as current
      pick a random index from problems on load and check currentlyLit against that to see if it was solved!
      -- if we want instead of end we keep score and end when they solve X puzzles

  100% SOLVABLE IN OUR GAME: T, L, Z but sideways, I,  H, Y, all on?, Border
*/