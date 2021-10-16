title = "Curling";

description = `
           [Tap] Sweep
Sweeping increases stone speed.
`;

characters = [
` 
 LLLL 
LLCCLL
LCCCCL
LCCCCL
LLCCLL
 LLLL
`,
` 
 LLLL 
LLLLLL
LLRRLL
LLRRLL
LLLLLL
 LLLL
`
];

const G = {
  WIDTH: 200,
  HEIGHT: 80,
  
  PUCKVERT: 1,
  PUCKPOSMAX: 67,
  PUCKPOSMIN: 13,
  
  PUCKANGLE: 0.01,
  DIRLENGTH: 25,
  PUCKANGLEMAX: Math.PI/4,
  PUCKANGLEMIN: -Math.PI/4,

  PUCKSPEEDMAX: 2,
  PUCKSPEEDMIN: 1,

  PUCKDECCELERATION: 0.002,

  PARADIST: 100,
}
// PUCK VERT is the speed the Puck moves up and down in vertical selection
// PUCK ANGLE is the speed the angle moves up and down in angle selection
// PUCK SPEED is the max/min horizontal speed (it controls our power bar width and our puck speed)

const STATE = {
  POSITION: 0,
  ANGLE: 1,
  POWER: 2,
  FREE: 3,
  RESET: 4
}

/**
 * @typedef {{
 * pos: Vector,
 * speed: number,
 * angle: number,
 * reverse: boolean,
 * state: number,
 * sprite: string,
 * target: Vector,
 * lives: number,
 * trueX: number,
 * scrubbing: boolean,
 * receivedScore: boolean,
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
 * trueX: number
 * y: number
 * radius: number
 * }} paraObj
 */

/**
 * @type { paraObj []}
 */
let objects;


/**
 * @typedef {{
 * trueX: number
 * y: number
 * innerRadius: number
 * outerRadius: number
 * }} targetObj
 */

/**
 * @type { targetObj }
 */
let target;

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
  //seed: 3,
  //isPlayingBgm: true,
  isReplayEnabled: true,
  theme: "shape"
};

function update() {
  if (!ticks) {
    let x = 50;
    objects = times(rndi(5, 10), () => {
      let y = rndi(13, 67)
      x += rndi(60,120)
      return {
        trueX: x,
        y: y,
        radius: 3,
      }
    });

    target = {
      trueX: x + 100,
      y: G.HEIGHT/2,
      innerRadius: 14,
      outerRadius: 28
    }
    
    scores = [];
    puck = {
      pos: vec(10, G.HEIGHT / 2),
      speed: 1,
      angle: 0,
      reverse: false,
      state: STATE.POSITION,
      sprite: "a",
      target: vec(10, G.HEIGHT / 2),
      lives: 3,
      trueX: 10,
      scrubbing: false,
      receivedScore: false,
    }
  }

  // WALLS
  color('light_cyan');
  rect(0, 0, G.WIDTH, G.PUCKPOSMIN - 3);
  rect(0, G.PUCKPOSMAX + 3, G.WIDTH, G.HEIGHT - G.PUCKPOSMAX - 3);

  //draw target
  let relativeX = target.trueX - puck.trueX 
  if (relativeX - target.outerRadius <= G.WIDTH - G.PARADIST){
    color("light_red");
    arc(vec(G.PARADIST + relativeX, target.y), target.outerRadius, 6, 0, 2 * PI);
    color("light_blue");
    arc(vec(G.PARADIST + relativeX, target.y), target.innerRadius, 3, 0, 2 * PI);
  }

  // draw puck
  color('black');
  let puckColl = char("a", puck.pos).isColliding;

  color("black");
  remove(objects, (o) => {
    let relativeX = o.trueX - puck.trueX 
    let disappear = (G.PARADIST + relativeX <= 0 - o.radius);
    if (relativeX - o.radius <= G.WIDTH - G.PARADIST){
      var collider = char("b", G.PARADIST + relativeX, o.y).isColliding;
      if (!disappear) { 
        disappear = collider.char.a;
        if (collider.char.a) { puck.speed -= 0.2; } 
      }
    }
    return disappear;
  });

  color("transparent");
  let scrubCollider = rect(input.pos, 4).isColliding.char.a;

  color("black");
  text(`SHOTS LEFT: ${puck.lives}`, vec(G.WIDTH/2 - 37, 4));

  text(`DIST: ${floor(10 * (target.trueX - puck.trueX)/60)/10}m`, 5, G.HEIGHT - 5);

  switch (puck.state) {
    case STATE.POSITION:
      // MOVE UP & DOWN, REVERSE WHEN HIT EDGE
      if ((puck.pos.y + puck.speed) > G.PUCKPOSMAX || (puck.pos.y - puck.speed) < G.PUCKPOSMIN) {
        puck.reverse = !puck.reverse;
      } 
      if (puck.reverse) {
        puck.pos.y += G.PUCKVERT;
      } else {
        puck.pos.y -= G.PUCKVERT;
      }
      if (input.isJustPressed) {
        // do set position
        // switch to STATE.ANGLE
        puck.lives--;
        puck.state = STATE.ANGLE;
      }
      break;
    case STATE.ANGLE:
      // Change angle up and down, reverse when hit edge
      // Draw line forecasting direction of current angle
      if (puck.reverse) {
        puck.angle += G.PUCKANGLE;
      } else {
        puck.angle -= G.PUCKANGLE;
      }
      puck.target.x = puck.pos.x + Math.cos(puck.angle)*G.DIRLENGTH;
      puck.target.y = puck.pos.y + Math.sin(puck.angle)*G.DIRLENGTH;
      color("light_black");
      line(puck.pos, puck.target, 1);
      if (puck.angle > G.PUCKANGLEMAX || puck.angle < G.PUCKANGLEMIN || puck.target.y > G.PUCKPOSMAX+3 || puck.target.y < G.PUCKPOSMIN-3){
        puck.reverse = !puck.reverse;
      }
      if (input.isJustPressed) {
        // angle setup already from above
        // reset puck.reverse for use in STATE.POWER
        puck.reverse = true;
        // switch to STATE.POWER
        puck.state = STATE.POWER;
      }
    break;
    case STATE.POWER:
      // Keep drawing direction line
      line(puck.pos, puck.target, 1);
      // DRAW Background of our Power Bar for visual indication of a "MAX"\
      // and red powerbar
      color("light_black");
      rect(G.WIDTH/2 - 20, G.HEIGHT - 6, 40, 5);
      color("light_red");
      rect(G.WIDTH/2 - 20, G.HEIGHT - 6, (puck.speed - G.PUCKSPEEDMIN)/(G.PUCKSPEEDMAX - G.PUCKSPEEDMIN) * 40, 5);
      // reuse our reverse logic for STATE.ANGLE, 
      // determines power bar growth && puck.speed value from 0 - 100
      if(floor(ticks/15) == ticks/15) {
        if(puck.reverse) {
          puck.speed += 0.1;
        } else {
          puck.speed -= 0.1;
        }
        if(puck.speed >= G.PUCKSPEEDMAX || puck.speed <= G.PUCKSPEEDMIN) {
          puck.reverse = !puck.reverse;
        }
      }
      if (input.isJustPressed) {
        // puck.speed is auto setup above!
        // switch to STATE.FREE
        puck.state = STATE.FREE;
      }
    break;
    case STATE.FREE:
      color("black");
      text(`${floor(puck.speed * 100)/100}m/s`, vec(G.WIDTH - 45, G.HEIGHT - 5));
      
      if (floor(ticks/30) == ticks/30) puck.scrubbing = false;

      //dont deccelerate if scrubbing
      if (input.isJustPressed && scrubCollider) {
        puck.scrubbing = true;
        //particle effect to show scrubbing
        color("light_black");
        particle(input.pos, 8);
      }

      if (!puck.scrubbing) {
        //deccelerate
        if (puck.speed > 0) {
          puck.speed -= G.PUCKDECCELERATION;
        } else {
          puck.speed = 0;
          puck.state = STATE.RESET;
        }
      }

      puck.target.x = Math.cos(puck.angle)* (puck.speed);
      puck.target.y = Math.sin(puck.angle)* (puck.speed);
      // POSSIBLE PARALLAX EFFECT IF WE WANT A LANE LONGER THAN 200 PIXELS
      puck.pos.y += puck.target.y;
      puck.trueX += puck.target.x;
      if (puck.pos.x + puck.target.x <= G.PARADIST){
        puck.pos.x += puck.target.x;
      } else { 
        // Parallax Effects
      }
      
      if (puckColl.rect.light_cyan){
        // change angle direction
        puck.angle = -puck.angle;
        if (puck.pos.y >= G.HEIGHT/2){
          puck.pos.y = G.PUCKPOSMAX;
        } else {
          puck.pos.y = G.PUCKPOSMIN;
        }
      }
    break;
    case STATE.RESET:
      //calculate score
      if (!puck.receivedScore) {
        let relativeX = target.trueX - puck.trueX;
        //if target is on screen
        if (relativeX - target.outerRadius <= G.WIDTH - G.PARADIST) {
          let targetCenter = vec(G.PARADIST + relativeX, target.y);
          let distance = puck.pos.distanceTo(targetCenter);
          let score = 500 - distance - (floor(distance/target.innerRadius) * distance);
          if ((floor(distance/target.innerRadius) == 0)) { myAddScore(score * 2); } else { myAddScore(score); }
          //100 - distance - (floor(distance/innerRadius) * distance) - (floor(distance/outerRadius) * distance)
            //inner radius gets 2x multiplier
          }
          puck.receivedScore = true;
      }
      //wait for player to click for next shot if they have lives left
      color("black");
      if (puck.lives > 0) {
        text("CLICK FOR NEXT SHOT", G.WIDTH/2 - 50, G.HEIGHT/2);
      } else {
        end("YOU FINISHED!!");
      }
      if (input.isJustPressed) {
        //reset puck values
        puck.pos = vec(10, G.HEIGHT / 2);
        puck.target = vec(10, G.HEIGHT / 2);
        puck.speed = 1;
        puck.angle = 0;
        puck.reverse = false;
        puck.trueX = 10;
        puck.scrubbing = false;
        puck.receivedScore = false;
        
        //empty and repopulate objects array
        objects = [];
        let x = 50;
        objects = times(rndi(5, 10), () => {
          let y = rndi(13, 67)
          x += rndi(60,120)
          return {
            trueX: x,
            y: y,
            radius: 3,
          }
        });

        //reset target value
        target.trueX = x + 100;

        //change to position state
        puck.state = STATE.POSITION;
      }
    break;
  }
  // Floating Scores
  remove(scores, (s) => {
    // color(s.color)
    s.pos.y -= 0.1;
    text("+" + floor(s.score), s.pos);
    s.age -= 1
    let disappear = (s.age <= 0);
    return disappear;
  })
}

function myAddScore(value, x = G.WIDTH/2, y = G.HEIGHT/2, color = "black", time = 60){
  let score = {
    pos: vec(x,y),
    age: time,
    score: value,
    color: color
  }
  scores.push(score);
  addScore(value);
}