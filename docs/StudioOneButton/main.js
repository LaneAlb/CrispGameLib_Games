//[Tap] Add "Friend"


// Title Screen Stuff
title = " Night Grazer";

//[Tap] Add "Friend"
description = `
 [Tap] Place
       Grass
`;

// Custom Sprites
characters = [
`  
   YY  
 RRYY
YYRRR
Y   Y
`,
`
l l l
ccccc
`,
];

// Game and Runtime Options
const G = {
  WIDTH: 100,
  HEIGHT: 100, 
  FENCE_SMin: 0.4,
  FENCE_SMax: 2,
  FENCE_WMin: 2,
  FENCE_WMax: 25,
  PLAYER_SPEED: 0.4
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  isReplayEnabled:true,
  isPlayingBgm: true,
  seed: 400,
  theme: "dark",
};

/**
 * @typedef  { object } Grass  - The Typescript object
 * @property { Vector } pos    - Position defined by Vector
 */ 

/**
 * @type { Grass [] }
 */
let grass; // stars is array of Star objects

/**
 * @typedef  { object } subGrass  - The Typescript object
 * @property { Vector } pos    - Position defined by Vector
 */ 

/**
 * @type { subGrass [] }
 */
let subGrass;
let player;
let dist;
let diff;
let Fences;
// Game Loop!
function update() {
  if (!ticks) { // init
    subGrass = times(35, () => { return {pos: vec( rnd(G.WIDTH * 0.3, G.WIDTH), rnd(G.HEIGHT * 0.3, G.HEIGHT * 0.8))}; });

    grass  =  times(1, () => { return {pos: vec(G.WIDTH * 0.3, G.HEIGHT * 0.5)}; });
    player = { pos: vec(5, G.HEIGHT * 0.5)}; // player character
    Fences = times(2, () => {
      const y = rnd(G.HEIGHT * 0.3, G.HEIGHT * 0.8);
      const wide = rnd(G.FENCE_WMin, G.FENCE_WMax)
      return { 
        pos: vec(G.WIDTH,y),
        width: wide,
        height: y - wide,
      };
    });
    diff = difficulty;
    dist = 2; // default
  }
  color("light_black");
  line(0, G.HEIGHT * 0.3, G.WIDTH, G.HEIGHT*0.3, 1);
  line(0, G.HEIGHT * 0.8, G.WIDTH, G.HEIGHT*0.8, 1);
  color("yellow");
  particle(0, G.HEIGHT * 0.3, 1, 0.4);
  particle(0, G.HEIGHT * 0.8, 1, 0.4);
  // subgrass background scrolling and drawing
  subGrass.forEach((sg) => {
    sg.pos.x -= rnd(G.GRASS_SMax);
    if( sg.pos.x < 0) {sg.pos.x = G.WIDTH;}
    color("light_green");
    box(sg.pos, 1);
  });

  // player setup
  color("black");
  char("a", player.pos);

  // input
  if(input.isJustPressed && grass.length < 1){
      grass.push({pos: vec(input.pos.x, input.pos.y)});
      play("hit");
      color("green");
      char("b", input.pos);
      dist = player.pos.distanceTo(grass[0].pos);
  }

  // move towards grass
  if(grass.length != 0 && (grass[0].pos.x > 0 && grass[0].pos.y > 0)){
    if(player.pos.x < grass[0].pos.x){ player.pos.x += G.PLAYER_SPEED;} else player.pos.x -= G.PLAYER_SPEED;
    if(player.pos.y < grass[0].pos.y){ player.pos.y += G.PLAYER_SPEED;} else player.pos.y -= G.PLAYER_SPEED;
  } else { player.pos.x -= G.PLAYER_SPEED; }

  // player setup
  color("black");
  char("a", player.pos);
  // MORE FENCES
  if(Math.floor(difficulty) > diff){
    diff = difficulty;
    const wide = rnd(G.FENCE_WMin, G.FENCE_WMax);
    const y = rnd(G.HEIGHT * 0.3, G.HEIGHT * 0.8);
    Fences.push({ 
      pos:    vec(G.WIDTH, y), 
      height: y - wide, 
      width:  wide,
    });
  }

  // "Obstacle" Scrolling
  Fences.forEach((B) => {
    B.pos.x -= rnd(G.GRASS_SMax);
    if( B.pos.x + B.width < 0) { 
      B.pos.x = G.WIDTH; 
      B.pos.y = rnd(G.HEIGHT * 0.3, G.HEIGHT * 0.8);
    }
    color("yellow");
    //particle effect
    particle(B.pos.x, B.pos.y, 1, 0.4);
    particle(B.pos.x + B.width, B.pos.y + B.width, 1, 0.4);

    color("light_black");
    line(B.pos, B.pos.x + B.width, B.pos.y + B.width);

  });
  
  remove(grass, (g)=>{
    color("green");
    const isGrassColliding = char("b", g.pos).isColliding.char.a;

    if(isGrassColliding){
      color("light_black");
      particle(player.pos);
      addScore(dist, player.pos);
    }
    return (isGrassColliding || g.pos.x < 0);
  })
  // End Game Params
  color("black");
  if(player.pos.y > G.HEIGHT || player.pos.y < 0 || player.pos.x < 0 || char("a", player.pos).isColliding.rect.light_black){
    end();
  }
}
