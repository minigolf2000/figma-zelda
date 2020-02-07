export const FPS = 60
export const WALK_SPEED = 3.5
export const DIAG_WALK_SPEED = 2.4

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

export function vector(facing: Facing) {
  switch (facing) {
    case 'up':
      return [0, -1]
    case 'down':
      return [0, 1]
    case 'left':
      return [-1, 0]
    case 'right':
      return [1, 0]
  }
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

