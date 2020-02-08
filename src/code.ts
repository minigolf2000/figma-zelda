import { FPS, displayHealth, Facing, WALK_SPEED, KNOCKBACK_DISTANCE } from './lib'
import { Sprite } from './sprite'
import { OctorokRed } from './enemies/octorok_red'
import { loadEnemies } from './enemies/enemies'
import { Collision, isOverlapping } from './collision'
import { buttonPressed, getMovementDirection, keysPressed, changeFacing } from './buttons'

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

figma.ui.onmessage = buttonPressed

function nextFrame() {
  if (keysPressed.action && linkState.swordActiveFrame === null) {
    linkState.swordActiveFrame = 0
  }

  let walking = false
  if (linkState.swordActiveFrame !== null) {
    sprite.setSprite(['sword', linkState.facing, linkState.swordActiveFrame])
  } else {
    linkState.facing = changeFacing(linkState.facing)
    const direction = getMovementDirection()
    walking = direction.x !== 0 || direction.y !== 0
    move(direction.multiply(WALK_SPEED))
  }

  const linkHitbox = {x: linkNode.x + 1, y: linkNode.y + 1, width: 14, height: 14}
  enemies.forEach((enemy: any) => {
    const enemyHitbox = enemy.nextFrame()
    const overlappingVector = isOverlapping(linkHitbox, enemyHitbox)
    if (linkState.invulnerabilityFrame === null && overlappingVector) {
      linkState.invulnerabilityFrame = 0
      linkState.health -= 0.5
      move(overlappingVector.multiply(KNOCKBACK_DISTANCE))

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

function move(vector: Vector) {
  const newX = linkNode.x + vector.x
  const newY = linkNode.y + vector.y

  if (collision.isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

if (main()) {
  setInterval(nextFrame, 1000 / FPS)
}