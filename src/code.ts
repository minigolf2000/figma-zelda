import { FPS, displayHealth, updateCamera } from './lib'
import { OctorokRed } from './enemies/octorok_red'
import { loadEnemies } from './enemies/enemies'
import { Collision, isOverlapping } from './collision'
import { buttonPressed, keysPressed } from './buttons'
import { Link } from './link'

let linkNode: InstanceNode = null
let worldNode: FrameNode
let link: Link = null
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
})

function nextFrame() {
  if (keysPressed.esc) {
    figma.closePlugin()
  }

  link.nextFrame()

  const linkHitbox = {x: linkNode.x + 1, y: linkNode.y + 1, width: 14, height: 14}
  enemies.forEach((enemy: any) => {
    const enemyHitbox = enemy.nextFrame()
    const overlappingVector = isOverlapping(linkHitbox, enemyHitbox)
    if (overlappingVector) {
      const health = link.takeDamage(overlappingVector)

      if (health > 0) {
        figma.ui.postMessage({health: displayHealth(health, 3)})
      } else {
        figma.closePlugin()
        return
      }
    }
  })

  updateCamera(linkNode, worldNode)
}

if (main()) {
  setInterval(nextFrame, 1000 / FPS)
}