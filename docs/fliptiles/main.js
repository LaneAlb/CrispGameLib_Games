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
let row1, row2, row3;
let tiles;
let cursor;

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
      var mod = (i % 3);
      var X = ( G.Box_Width * (mod*1.1) ) + G.Box_Width*0.4;
      var Y = G.HEIGHT*0.5 - G.Box_Width*1.5;
      console.log(vec(X, Y));
      return { pos: vec(X, Y), width: G.Box_Width };
    });
    console.log("row2");
    row2 = times(3, (i) =>{
      var mod = (i % 3);
      var X = (G.Box_Width* (mod*1.1)) + G.Box_Width*0.4;
      var Y = G.HEIGHT*0.5 - G.Box_Width*0.4;
      console.log(vec(X, Y));
      return { pos: vec(X, Y), width: G.Box_Width };
    });
    console.log("row3");
    row3 = times(3, (i) =>{
      var mod = (i % 3);
      var X = (G.Box_Width* (mod*1.1)) + G.Box_Width*0.4;
      var Y = G.HEIGHT*0.5 + G.Box_Width*0.7;
      console.log(vec(X, Y));
      return { pos: vec(X, Y), width: G.Box_Width };
    });
    tiles = [ row1, row2, row3 ];
    cursor = {pos: vec(G.WIDTH*0.5, G.HEIGHT*0.5)};
  } // end init()

  tiles.forEach( (bs) =>{
    bs.forEach((block) => {
      color("black");
      rect(block.pos, block.width, block.width);
      // 1 pixel block in topleft of each tile
      color("red");
      box(block.pos, 2);
    });
  });

  // track player pointer and clamp to game
  cursor.pos = vec(input.pos.x, input.pos.y);
  cursor.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  color("red");
  box(cursor.pos, 2);

  if(input.isJustPressed && box(cursor.pos, 2).isColliding.rect.black){
    console.log("Clicked a White Square");
    // according to console.log in Init
    // COLUMN 1 === x: 20  to x: 20 + box.width
    // COLUMN 2 === x: 75  to x: 75 +  box.width
    // COLUMN 3 === x: 130 to x: 130 + box.width
    // ROW 1 === y: 25  to y: 25  - box.width
    // ROW 2 === y: 80  to y: 80  - box.width
    // ROW 3 === y: 135 to y: 135 - box.width 
    // create a coordinate system so you can just hard index and draw new colors?
    // smarter way?
  }
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