title = "Curling";

description = `
curlingGame
`;

characters = [
`
 LLLL 
LLLLLL
LLLLLL
LLLLLL
LLLLLL
 LLLL
`
];

const G = {
  WIDTH: 200,
  HEIGHT: 80,
  
  PUCKVERT: 1,
  PUCKPOSMAX: 70,
  PUCKPOSMIN: 10,
  
  PUCKANGLE: 0.01,
  DIRLENGTH: 25,
  PUCKANGLEMAX: Math.PI/4,
  PUCKANGLEMIN: -Math.PI/4,

  PUCKSPEEDMAX: 25,
  PUCKSPEEDMIN: 1, // set to 1 because we dont want player to set launch speed to 0
}
// PUCK VERT is the speed the Puck moves up and down in vertical selection
// PUCK ANGLE is the speed the angle moves up and down in angle selection
// PUCK SPEED is the max/min horizontal speed (it controls our power bar width and our puck speed)

const STATE = {
  POSITION: 0,
  ANGLE: 1,
  POWER: 2,
  FREE: 3
}

/**
 * @typedef {{
 * pos: Vector,
 * speed: number,
 * angle: number,
 * reverse: boolean,
 * state: number,
 * sprite: string,
 * target: Vector
 * }} Puck
 */
// Reverse is to reverse the direction of movement in Angle/Vertical selection
// When the puck reaches an 'edge'

/**
 * @type { Puck }
 */
let puck;

/**
 * @typedef {{
 * pos: Vector,
 * age: number,
 * score: number,
 * color: string,
 * }} Score
 */

/**
 * @type { Score []}
 */
let scores;

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 3,
  isPlayingBgm: true,
  isReplayEnabled: true,
  theme: "simple"
};

function update() {
  if (!ticks) {
    scores = []
    puck = {
      pos: vec(10, G.HEIGHT / 2),
      speed: 1,
      angle: 0,
      reverse: false,
      state: STATE.POSITION,
      sprite: "a",
      target: vec(10, G.HEIGHT / 2),
    }
  }
  // DRAW BACKGROUND
  color('black')
  char("a", puck.pos);

  color('light_cyan');
  rect(0, 0, G.WIDTH, G.PUCKPOSMIN - 3);
  rect(0, G.PUCKPOSMAX + 3, G.WIDTH, G.HEIGHT - G.PUCKPOSMAX - 3);
  
  // UPDATE OBJECT INFOS DEPENDING ON STATE
  text(puck.angle.toString(), 3, 10);
  switch (puck.state) {
    case STATE.POSITION:
      // MOVE UP & DOWN, REVERSE WHEN HIT EDGE
      if ((puck.pos.y + puck.speed) > G.PUCKPOSMAX || (puck.pos.y - puck.speed) < G.PUCKPOSMIN) {
        puck.reverse = !puck.reverse;
      } 
      if (puck.reverse) {
        puck.pos.y += G.PUCKVERT
      } else {
        puck.pos.y -= G.PUCKVERT;
      }
      if (input.isJustPressed) {
        // do set position
        // switch to STATE.ANGLE
        puck.state = STATE.ANGLE
      }
      break;
    case STATE.ANGLE:
      // Change angle up and down, reverse when hit edge
      // Draw line forecasting direction of current angle
      if (puck.reverse) {
        puck.angle += G.PUCKANGLE 
      } else {
        puck.angle -= G.PUCKANGLE
      }
      puck.target.x = puck.pos.x + Math.cos(puck.angle)*G.DIRLENGTH;
      puck.target.y = puck.pos.y + Math.sin(puck.angle)*G.DIRLENGTH;
      line(puck.pos, puck.target, 1)
      if (puck.angle > G.PUCKANGLEMAX || puck.angle < G.PUCKANGLEMIN || puck.target.y > G.PUCKPOSMAX+3 || puck.target.y < G.PUCKPOSMIN-3){
        puck.reverse = !puck.reverse
      }
      if (input.isJustPressed) {
        // angle setup already from above
        // reset puck.reverse for use in STATE.POWER
        puck.reverse = true;
        // switch to STATE.POWER
        puck.state = STATE.POWER
      }
    break;
    case STATE.POWER:
      // Keep drawing direction line
      line(puck.pos, puck.target, 1);
      // reuse our reverse logic for STATE.ANGLE, 
      // determines power bar growth && puck.speed value from 0 - 100
      if (puck.reverse) {
        puck.speed += 1;
      } else {
        puck.speed -= 1;
      }
      // DRAW Background of our Power Bar for visual indication of a "MAX"\
      // and red powerbar
      color("light_black");
      rect((G.WIDTH - G.PUCKSPEEDMAX)/2, G.HEIGHT - 5, G.PUCKSPEEDMAX, 5);
      color("light_red");
      rect((G.WIDTH - G.PUCKSPEEDMAX)/2, G.HEIGHT - 5, puck.speed, 5);
      if (puck.speed > G.PUCKSPEEDMAX || puck.speed <= G.PUCKSPEEDMIN){
        puck.reverse = !puck.reverse;
      }
      // CHECK: Can I accidently set player speed to 0?
      if (input.isJustPressed) {
        // puck.speed is auto setup above!
        console.log(puck.angle * 100);
        // switch to STATE.FREE
        puck.state = STATE.FREE;
      }
    break;
    case STATE.FREE:
      // do we want to redraw the power bar here?
      // this is WICKED FAST [ TEMP FIX divide puck.speed ]
      puck.target.x = Math.cos(puck.angle)* (puck.speed/10);
      puck.target.y = Math.sin(puck.angle)* (puck.speed/10);
      puck.pos.x += puck.target.x;
      puck.pos.y += puck.target.y;
      // check if Collide with Cyan Rect (our wall)
      if(char("a", puck.pos).isColliding.rect.light_cyan){

        // change angle direction
        puck.angle = -puck.angle;

        // bottom collision
        if (puck.pos.y > G.HEIGHT / 2) {
          puck.pos = vec(puck.pos.x, G.PUCKPOSMAX - 3);
        }
        
        // top collision
        if (puck.pos.y < G.HEIGHT / 2) {
          puck.pos = vec(puck.pos.x, G.PUCKPOSMIN + 3);
        }
      }
      // Update Puck position in the direction it is currently moving
      if (input.isJustPressed) {
        // add melted ice object to array at input position
        // our "sweeping"
      }
    break;
  }
  
  // DRAW UPDATED & PERSISTENT OBJECTS BELOW HERE
  
  // Floating Scores
  remove(scores, (s) => {
    // color(s.color)
    s.pos.y -= 0.1
    text("+" + s.score, s.pos)
    s.age -= 1
    let disappear = (s.age <= 0)
    return disappear
  })
}

function myAddScore(value, x = G.WIDTH/2, y = G.HEIGHT/2, color = "black", time = 60){
  let score = {
    pos: vec(x,y),
    age: time,
    score: value,
    color: color
  }
  scores.push(score)
  addScore(value);
}