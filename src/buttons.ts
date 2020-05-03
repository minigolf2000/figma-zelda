import { Facing } from "./lib"

interface Buttons {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  x: boolean
  z: boolean
  esc: boolean
}

export let paused = false
export const keysPressed: Buttons = {
  up: false, down: false, left: false, right: false, x: false, z: false, esc: false
}

export function onKeyPressed(msg: any) {
  if (msg.type === 'blur') {
    paused = true
    return
  }
  if (msg.type === 'focus') {
    paused = false
    return
  }

  switch (msg.keyCode as number) {
    // case 13: // ENTER
    // case 16: // SHIFT
    // case 32: // SPACE
    case 88: // X
      keysPressed.x = (msg.type === 'keydown') ? true : false
      break
    case 90: // Z
      keysPressed.z = (msg.type === 'keydown') ? true : false
      break
    case 37: // LEFT_ARROW
    case 65: // A
      keysPressed.left = (msg.type === 'keydown') ? true : false
      break
    case 38: // UP_ARROW
    case 87: // W
      keysPressed.up = (msg.type === 'keydown') ? true : false
      break
    case 39: // RIGHT_ARROW
    case 68: // D
      keysPressed.right = (msg.type === 'keydown') ? true : false
      break
    case 40: // DOWN_ARROW
    case 83: // S
      keysPressed.down = (msg.type === 'keydown') ? true : false
      break
    case 27: // ESC
      keysPressed.esc = true
      break
  }
}

export function getMovementDirection() {
  const vector = {x: 0, y: 0}
  if (keysPressed.left) vector.x -= 1
  if (keysPressed.right) vector.x += 1
  if (keysPressed.up) vector.y -= 1
  if (keysPressed.down) vector.y += 1
  return vector
}

export function changeFacing(facing: Facing) {
  if (keysPressed.down && !keysPressed.up) return 'down'
  if (keysPressed.up && !keysPressed.down) return 'up'
  if (keysPressed.left && !keysPressed.right) return 'left'
  if (keysPressed.right && !keysPressed.left) return 'right'
  return facing
}