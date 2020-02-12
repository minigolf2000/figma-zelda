import { FPS, displayHealth, updateCamera } from './lib'
import { OctorokRed } from './enemies/octorok_red'
import { loadEnemies } from './enemies/enemies'
import { Collision, isOverlapping, Rectangle } from './collision'
import { buttonPressed, keysPressed } from './buttons'
import { Link } from './link'

let linkNode: InstanceNode = null
let worldNode: FrameNode
let link: Link = null
let collision: Collision = null
let enemies: OctorokRed[] = []
const graveyard: any[] = []

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
  collision = new Collision(worldNode)
  const swordNode = worldNode.findOne((node: SceneNode) => node.name === 'sword') as InstanceNode
  link = new Link(linkNode, collision, swordNode)

  enemies = loadEnemies(worldNode, collision, linkNode)
  linkNode.masterComponent.setRelaunchData({relaunch: ''})
  figma.ui.postMessage({addItem: 'sword'})
  figma.currentPage.selection = []
  return true
}

figma.showUI(__html__, {height: 160})
figma.ui.postMessage({health: displayHealth(3, 3)})

figma.ui.onmessage = buttonPressed

figma.on("close", () => {
  figma.currentPage.selection = [linkNode]
  linkNode.visible = true
  graveyard.forEach((node: SceneNode) => node.visible = true)
})

function nextFrame() {
  if (keysPressed.esc) {
    figma.closePlugin()
  }

  link.nextFrame()

  const linkHurtbox: Rectangle = {x: linkNode.x + 1, y: linkNode.y + 1, width: 14, height: 14}
  const linkHitboxes = link.hitBoxes()
  enemies.forEach((enemy: any, enemyIndex: number) => {
    const enemyHitbox = enemy.nextFrame()

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

  updateCamera(linkNode, worldNode)
}

if (main()) {
  setInterval(nextFrame, 1000 / FPS)
}