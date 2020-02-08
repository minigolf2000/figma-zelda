import { FPS, WALK_SPEED, DIAG_WALK_SPEED, displayHealth, Facing } from './lib'
import { Sprite } from './sprite'
import { OctorokRed } from './enemies/octorok_red'
import { loadEnemies } from './enemies/enemies'
import { Collision, isOverlapping } from './collision'

// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".

let linkNode: InstanceNode = null
let worldNode: FrameNode
let sprite: Sprite | null = null
let collision: Collision = null
let enemies: OctorokRed[] = []

function main() {
  if (!figma.currentPage.selection) {
    figma.closePlugin("Please have Link selected while running the Plugin")
    return false
  }

  if (figma.currentPage.selection[0].type !== 'INSTANCE') {
    figma.closePlugin("Selected node must be an instance, whose master lives in 'sprites' frame")
    return false
  }

  linkNode = figma.currentPage.selection[0]
  if (linkNode.parent.type !== 'FRAME') {
    figma.closePlugin("World must be a frame")
    return
  }
  worldNode = linkNode.parent
  sprite = new Sprite(linkNode)
  collision = new Collision(worldNode)

  enemies = loadEnemies(worldNode, collision, linkNode)
  linkNode.masterComponent.setRelaunchData({relaunch: ''})
  return true
}

figma.showUI(__html__)
figma.ui.postMessage({health: displayHealth(3, 3)})

interface Buttons {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  action: boolean
}
const keysPressed: Buttons = {
  up: false, down: false, left: false, right: false, action: false
}

interface State {
  health: number
  walkingFrame: number
  invulnerabilityFrame: number | null
  swordActiveFrame: number | null
  facing: Facing
}

const linkState: State = {
  health: 3,
  walkingFrame: 0,
  invulnerabilityFrame: null,
  swordActiveFrame: null,
  facing: 'down'
}


figma.ui.onmessage = msg => {
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
  }
}

function nextFrame() {
  let walking = false

  if (keysPressed.action && linkState.swordActiveFrame === null) {
    linkState.swordActiveFrame = 0
  }

  if (linkState.swordActiveFrame !== null) {
    sprite.setSprite(['sword', linkState.facing, linkState.swordActiveFrame])
  } else {
    if (keysPressed.left && !keysPressed.right) {
      moveLeft(keysPressed.up === keysPressed.down)
      linkState.facing = 'left'
      walking = true
    }
    if (keysPressed.right && !keysPressed.left) {
      moveRight(keysPressed.up === keysPressed.down)
      linkState.facing = 'right'
      walking = true
    }
    if (keysPressed.up && !keysPressed.down) {
      moveUp(keysPressed.left === keysPressed.right)
      linkState.facing = 'up'
      walking = true
    }
    if (keysPressed.down && !keysPressed.up) {
      moveDown(keysPressed.left === keysPressed.right)
      linkState.facing = 'down'
      walking = true
    }
  }

  const linkHitbox = {x: linkNode.x + 1, y: linkNode.y + 1, width: 14, height: 14}
  enemies.forEach((enemy: any) => {
    const enemyHitbox = enemy.nextFrame()
    if (linkState.invulnerabilityFrame === null && isOverlapping(enemyHitbox, linkHitbox)) {
      linkState.invulnerabilityFrame = 0
      linkState.health -= 0.5

      if (linkState.health > 0) {
        figma.ui.postMessage({health: displayHealth(linkState.health, 3)})
      } else {
        figma.closePlugin();
        return
      }
    }
  })

  if (linkState.swordActiveFrame !== null) {
    sprite.setSprite(['sword', linkState.facing, linkState.swordActiveFrame])
  } else {
    sprite.setSprite(['basic', linkState.facing, walking && linkState.walkingFrame > 2 ? 1 : 0])
  }

  // Increment state
  if (walking) {
    if (linkState.walkingFrame === 3) linkState.walkingFrame = 0
    else linkState.walkingFrame++
  }
  if (linkState.swordActiveFrame !== null) {
    linkState.swordActiveFrame++
    if (linkState.swordActiveFrame === 4) linkState.swordActiveFrame = null
  }

  if (linkState.invulnerabilityFrame !== null) {
    linkState.invulnerabilityFrame++
    if (linkState.invulnerabilityFrame && linkState.invulnerabilityFrame % 2 === 0) {
      linkNode.visible = !linkNode.visible
    }
    if (linkState.invulnerabilityFrame === 20) {
      linkNode.visible = true
      linkState.invulnerabilityFrame = null
    }
  }


}

function moveLeft(fast: boolean) {
  const velocity = fast ? WALK_SPEED : DIAG_WALK_SPEED

  const newX = linkNode.x - velocity
  const newY = linkNode.y

  if (collision.isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

function moveUp(fast: boolean) {
  const velocity = fast ? WALK_SPEED : DIAG_WALK_SPEED
  const newX = linkNode.x
  const newY = linkNode.y - velocity

  if (collision.isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

function moveRight(fast: boolean) {
  const velocity = fast ? WALK_SPEED : DIAG_WALK_SPEED
  const newX = linkNode.x + velocity
  const newY = linkNode.y

  if (collision.isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

function moveDown(fast: boolean) {
  const velocity = fast ? WALK_SPEED : DIAG_WALK_SPEED
  const newX = linkNode.x
  const newY = linkNode.y + velocity

  if (collision.isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

if (main()) {
  setInterval(nextFrame, 1000 / FPS)
}