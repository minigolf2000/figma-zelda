import { FPS, displayHealth, updateCamera } from './lib'
import { loadEnemies } from './enemies/enemies'
import { Tiles, isOverlapping, Rectangle } from './tiles'
import { onKeyPressed, keysPressed } from './buttons'
import { Link } from './link'
import { Actor } from './actor'

let linkNode: InstanceNode
let worldNode: FrameNode
let link: Link
let tiles: Tiles
let enemies: Actor[]
const graveyard: SceneNode[] = []

function addProjectile(projectile: Actor) {
  enemies.push(projectile)
}

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
  if (!linkNode.parent || linkNode.parent.type !== 'FRAME') {
    figma.closePlugin("Link must be inside a 'World' Frame")
    return false
  }
  worldNode = linkNode.parent
  tiles = new Tiles(worldNode)
  const swordNode = worldNode.findOne((node: SceneNode) => node.name === 'sword') as InstanceNode
  link = new Link(linkNode, tiles, swordNode)

  enemies = loadEnemies(worldNode, tiles, linkNode, addProjectile)
  linkNode.masterComponent.setRelaunchData({relaunch: ''})
  figma.ui.postMessage({addItem: 'sword'})
  figma.currentPage.selection = []
  return true
}

function nextFrame() {
  if (keysPressed.esc) {
    figma.closePlugin()
    return
  }

  const linkHurtbox = link.nextFrame()
  const linkHitboxes = link.hitBoxes()
  enemies.forEach((enemy: Actor, enemyIndex: number) => {
    const enemyHitbox = enemy.nextFrame()
    if (!enemyHitbox) {
      enemies.splice(enemyIndex, 1)
      return
    }

    const hurtVector = isOverlapping(linkHurtbox, enemyHitbox)
    if (hurtVector) {
      const health = link.takeDamage(hurtVector)

      if (health > 0) {
        figma.ui.postMessage({health: displayHealth(health, 3)})
      } else {
        figma.closePlugin()
        return
      }
    }

    linkHitboxes.forEach((hitbox: Rectangle, i: number) => {
      const hitVector = isOverlapping(enemyHitbox, hitbox)
      if (hitVector) {
        const health = enemy.takeDamage(hitVector)
        if (health <= 0) {
          enemy.getNode().visible = false
          graveyard.push(enemy.getNode())
          enemies.splice(enemyIndex, 1)
        }
      }
    })
  })
  // projectiles.forEach((projectile: Actor, i: number) => {
  //   projectile.nextFrame()
  //   const hurtVector = isOverlapping(linkHurtbox, enemyHitbox)
  // })

  updateCamera(linkNode, worldNode)
  printFPS()
}

let lastFrameTimestamp: number = Date.now()
function printFPS() {
  const currentFrameTimestamp = Date.now()
  const fps = Math.round(1000 / (currentFrameTimestamp - lastFrameTimestamp))
  figma.ui.postMessage({fps})
  lastFrameTimestamp = currentFrameTimestamp
}

figma.showUI(__html__, {height: 160})
figma.ui.postMessage({health: displayHealth(3, 3)})

figma.ui.onmessage = onKeyPressed

figma.on("close", () => {
  figma.currentPage.selection = [linkNode]
  linkNode.visible = true
  worldNode.findOne((node: SceneNode) => node.type === 'FRAME' && node.name === 'tiles')!.visible = true
  worldNode.fills = [{
    type: "SOLID",
    color: {r: 252 / 255, g: 216 / 255, b: 168 / 255}
  }]
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE' && node.name === 'octorok-rock')!.forEach((node: SceneNode) => node.remove())
  graveyard.forEach((node: SceneNode) => node.visible = true)
})

if (main()) {
  setInterval(nextFrame, 1000 / FPS)
}