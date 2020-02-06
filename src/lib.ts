export const FPS = 60
export const WALK_SPEED = 3.5
export const DIAG_WALK_SPEED = 2.4
export const COLLISION_TILES = new Set(['tree', 'rock', 'water', 'rock_s'])


export function displayHealth(current: number, max: number) {
  const missing = max - current
  let displayHealth = ''
  while (current >= 1) {
    displayHealth += '💗'
    current -= 1
  }
  if (current >= .5) {
    displayHealth += '💔'
  }
  Array.from(Array(Math.floor(missing))).forEach((x, i) => {
    displayHealth += '🖤'
  });
  return displayHealth
}
  