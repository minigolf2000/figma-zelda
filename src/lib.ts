export const FPS = 60
export const WALK_SPEED = 3
export const KNOCKBACK_DISTANCE = 16

export type Facing = 'up' | 'down' | 'left' | 'right'

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
  })
  return displayHealth
}

export function rotation(facing: Facing) {
  switch (facing) {
    case 'down':
      return 0
    case 'left':
      return 90
    case 'up':
      return 180
    case 'right':
      return 270
  }
}

