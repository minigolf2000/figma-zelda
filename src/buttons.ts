import { displayTriforceShards } from "./lib"

export interface Buttons {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  x: boolean
  z: boolean
  esc: boolean
}

export let paused = false

export function onButtonsPressed(msg: any, buttonsPressed: Buttons) {
  if (msg.type === 'blur') {
    paused = true
    figma.ui.postMessage({triforceShards: "Game paused. Click here to resume."})
    return
  }
  if (msg.type === 'focus') {
    paused = false
    figma.ui.postMessage({triforceShards: displayTriforceShards()})
    return
  }

  switch (msg.keyCode as number) {
    // case 13: // ENTER
    // case 16: // SHIFT
    // case 32: // SPACE
    case 88: // X
    case 190: // .
      buttonsPressed.x = (msg.type === 'keydown') ? true : false
      break
    case 90: // Z
    case 188: // ,
      buttonsPressed.z = (msg.type === 'keydown') ? true : false
      break
    case 37: // LEFT_ARROW
    case 65: // A
      buttonsPressed.left = (msg.type === 'keydown') ? true : false
      break
    case 38: // UP_ARROW
    case 87: // W
      buttonsPressed.up = (msg.type === 'keydown') ? true : false
      break
    case 39: // RIGHT_ARROW
    case 68: // D
      buttonsPressed.right = (msg.type === 'keydown') ? true : false
      break
    case 40: // DOWN_ARROW
    case 83: // S
      buttonsPressed.down = (msg.type === 'keydown') ? true : false
      break
    case 27: // ESC
      buttonsPressed.esc = true
      break
  }
}
