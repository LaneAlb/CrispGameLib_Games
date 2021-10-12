title = "Flipper";

description = `
[Tap] Flip Tile
Match the image shown!
`;

characters = [];

// Game and Runtime Options
const G = {
  WIDTH: 200,
  HEIGHT: 200,
  Box_Width: 50,
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  isReplayEnabled:true,
  //isPlayingBgm: true,
  //seed: 400,
  theme: "shapeDark",
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
let tiles; // 
let cursor;
let clicked;

function update() {
  if (!ticks) {
    // RECT's have pos relative to upper left corner
    // SOOOO
    // to "center" 3 rects we take 
    // X === boxWidth * offset + (value to "center" the blocks as a row)
    // Y === relative to center is just playing with values to get a nice offset
    // in our case 1.5 to get row1, + or - 0.5 for row2 and row3
    // below math has 0.4 and 0.7 for row2 and row3 to give a space in between tiles
    console.log("row1");
    row1 = times(3, (i) =>{
      var mod = (i % 3); // 1
      var X = ( G.Box_Width * (mod*1.1) ) + G.Box_Width*0.4;
      var Y = G.HEIGHT*0.5 - G.Box_Width*1.5;
      console.log(vec(X, Y));
      return { pos: vec(X, Y), width: G.Box_Width, lit: false };
    });
    console.log("row2");
    row2 = times(3, (i) =>{
      var mod = (i % 3);
      var X = (G.Box_Width* (mod*1.1)) + G.Box_Width*0.4;
      var Y = G.HEIGHT*0.5 - G.Box_Width*0.4;
      console.log(vec(X, Y));
      return { pos: vec(X, Y), width: G.Box_Width, lit: false };
    });
    console.log("row3");
    row3 = times(3, (i) =>{
      var mod = (i % 3);
      var X = (G.Box_Width* (mod*1.1)) + G.Box_Width*0.4;
      var Y = G.HEIGHT*0.5 + G.Box_Width*0.7;
      console.log(vec(X, Y));
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

  // track player pointer and clamp to game
  cursor.pos = vec(input.pos.x, input.pos.y);
  cursor.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  color("red");
  box(cursor.pos, 2);
  
  if(input.isJustPressed && ( box(cursor.pos, 2).isColliding.rect.black || box(cursor.pos, 2).isColliding.rect.cyan ) ){
    console.log("Clicked a White Square");
    // hard index the adjacent blocks
    findBlock(input.pos);
    console.log("Row " + clicked[0]);
    console.log("Col " + clicked[1]);
    //console.log(tiles[clicked[0]][clicked[1]].pos);
    let currBlock = tiles[clicked[0]][clicked[1]];
    currBlock.lit = !currBlock.lit;
    lightAdjacent(clicked[0], clicked[1]);
  }
}
// find adjacent blocks and light or unlight them
function lightAdjacent(x, y){
   let xMin = x - 1;
   let xMax = x + 1;
   let yMin = y - 1;
   let yMax = y + 1;
   if(xMin >= 0) { tiles[xMin][y].lit = !tiles[xMin][y].lit;}
   if(xMax <= 2) { tiles[xMax][y].lit = !tiles[xMax][y].lit;}
   if(yMin >= 0) { tiles[x][yMin].lit = !tiles[x][yMin].lit;}
   if(yMax <= 2) { tiles[x][yMax].lit = !tiles[x][yMax].lit;}
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
// IGNORE BELOW FOR NOW
// hopefully I dont have to build an entire function around grabbing specific tile locales but
// it would be put here
/*
function pointBetween(point, tiles){
  tiles.forEach(row => {
    row.forEach( block => {
      var errorMin = block.pos.x ;
      var errorMax = ;
      if(point.x within block.pos +- block.width){
        console.log("block " + );
      }
    })
  })
  //i think you just redraw as you see the correct indices;
}
*/