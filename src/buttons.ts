import { Vector } from "./vector"
import { Facing } from "./lib"

interface Buttons {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  action: boolean
}
export const keysPressed: Buttons = {
  up: false, down: false, left: false, right: false, action: false
}

export function buttonPressed(msg: any) {
  switch (msg.keyCode as number) {
    case 13: // ENTER
    case 16: // SHIFT
    case 17: // CTRL
    case 18: // ALT
    case 32: // SPACE
      keysPressed.action = (msg.type === 'keydown') ? true : false
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
      figma.closePlugin()
      break
  }
}

export function getMovementDirection() {
  const vector = new Vector(0, 0)
  if (keysPressed.left) vector.x -= 1
  if (keysPressed.right) vector.x += 1
  if (keysPressed.up) vector.y -= 1
  if (keysPressed.down) vector.y += 1
  return vector.normalize()
}

export function changeFacing(facing: Facing) {
  if (keysPressed.down && !keysPressed.up) return 'down'
  if (keysPressed.up && !keysPressed.down) return 'up'
  if (keysPressed.left && !keysPressed.right) return 'left'
  if (keysPressed.right && !keysPressed.left) return 'right'
  return facing
}