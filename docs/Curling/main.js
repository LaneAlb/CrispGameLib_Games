title = "Curling";

description = `
curlingGame
`;

characters = [];

const G = {
  WIDTH: 200,
  HEIGHT: 80
}

/**
 * @typedef {{
 * pos: Vector,
 * speed: number,
 * angle: number
 * }} Puck
 */

/**
 * @type { Puck }
 */
let puck;

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 3,
  isPlayingBgm: true,
  isReplayEnabled: true,
  theme: "simple"
};

function update() {
  if (!ticks) {
  }
}
// Lane's goal for 10/13 setup mr. curling ball with click to confirm horizontal placement
// Hello Colin is typing a comment on line 16, this is tht comment