import { FPS, displayHealth, updateCamera, setWorldNode, getWorldNode } from './lib'
import { loadEnemies } from './enemies/enemies'
import { Tiles, isOverlapping, snapTilesToGrid } from './tiles'
import { onKeyPressed, keysPressed, paused } from './buttons'
import { Link } from './link'
import { Actor } from './actor'

let linkNode: InstanceNode
let link: Link
let tiles: Tiles
let enemies: Actor[]
let projectiles: Actor[] = []

function addProjectile(projectile: Actor) {
  projectiles.push(projectile)
}

function findLinkNode() {
  const firstSelectedNode = figma.currentPage.selection[0]
  if (firstSelectedNode?.type === 'INSTANCE' && firstSelectedNode.name === 'link') {
    return firstSelectedNode
  }

  if (firstSelectedNode?.type === 'FRAME') {
    return firstSelectedNode.findOne((node: SceneNode) => node.name === 'link' && node.type === 'INSTANCE') as InstanceNode
  }

  if (figma.currentPage.selection.length === 0) {
    return figma.currentPage.findOne((node: SceneNode) => node.name === 'link' && node.type === 'INSTANCE') as InstanceNode
  }

  return null
}

function main() {
  const linkNodeOrNull = findLinkNode()
  if (linkNodeOrNull) {
    linkNode = linkNodeOrNull
  } else {
    figma.closePlugin("Please have Link selected while running the Plugin")
    return false
  }

  if (!linkNode.parent || linkNode.parent.type !== 'FRAME') {
    figma.closePlugin("Link must be inside a 'World' Frame")
    return false
  }

  const templateWorldNode = linkNode.parent
  if (templateWorldNode.getPluginData("running-world") ===  "true") {
    figma.closePlugin("Multiplayer is not supported yet!")
    return false
  }

  snapTilesToGrid(templateWorldNode)
  templateWorldNode.setPluginData("original-world", "true")
  templateWorldNode.visible = false

  const worldNode = templateWorldNode.clone()
  worldNode.setPluginData("running-world", "true")
  setWorldNode(worldNode)
  worldNode.visible = true
  figma.currentPage.selection = [worldNode]
  linkNode = findLinkNode()!
  tiles = new Tiles(worldNode)
  const swordNode = worldNode.findOne((node: SceneNode) => node.name === 'sword') as InstanceNode
  link = new Link(linkNode, tiles, swordNode, addProjectile)


  // link.getItem('sword')
  figma.ui.postMessage({item: "sword"})

  enemies = loadEnemies(worldNode, tiles, linkNode, addProjectile)
  figma.currentPage.setRelaunchData({relaunch: ''})
  linkNode.masterComponent.setRelaunchData({relaunch: ''})
  worldNode.setRelaunchData({relaunch: ''})
  figma.ui.postMessage({addItem: 'sword'})
  figma.currentPage.selection = []
  return true
}

function nextFrame() {
  if (paused) {
    figma.ui.postMessage({message: "Game paused. Click here to resume."})
    return
  }
  if (keysPressed.esc) {
    figma.closePlugin()
    return
  }

  if (link.getHealth() <= 0) {
    if (!link.deathAnimation()) {
      figma.closePlugin()
    }
    return
  }
  const onItem = tiles.onItem({x: linkNode.x, y: linkNode.y})
  if (onItem) {
    switch (onItem.name) {
      case 'triforce':
        figma.closePlugin("You win")
        return
      case 'bow':
        onItem.visible = false
        link.getItem('bow')
        figma.ui.postMessage({addItem: "bow"})
        break
    }
  }

  const linkHurtbox = link.nextFrame()
  const linkHitbox = link.hitBox()
  projectiles = projectiles.filter((projectile: Actor) => !!projectile.nextFrame(linkNode))

  enemies.forEach((enemy: Actor, enemyIndex: number) => {
    const enemyHitbox = enemy.nextFrame(linkNode)
    if (!enemyHitbox) {
      enemies.splice(enemyIndex, 1)
      return
    }

    // enemies damage link
    const hurtVector = isOverlapping(linkHurtbox, enemyHitbox)
    if (hurtVector) {
      const health = link.takeDamage(enemy.getDamage(), hurtVector)
      figma.ui.postMessage({health: displayHealth(health, 3)})
    }

    // link damages enemies
    if (linkHitbox) {
      const hitVector = isOverlapping(enemyHitbox, linkHitbox)
      if (hitVector) {
        enemy.takeDamage(enemy.getDamage(), hitVector)
      }
    }

    projectiles = projectiles.filter((projectile: Actor) => {

      // projectiles damage link
      const hurtVector = isOverlapping(linkHurtbox, projectile.getNode())
      if (hurtVector) {
        if (!link.isShielding(projectile)) {
          link.takeDamage(projectile.getDamage(), hurtVector)
        }
        projectile.getNode().remove()
        return false
      }

      // projectiles damage enemies
      const hitVector = isOverlapping(enemyHitbox, projectile.getNode())
      if (hitVector) {
        enemy.takeDamage(projectile.getDamage(), hitVector)
        projectile.getNode().remove()
        return false
      }
      return true
    })
  })

  updateCamera(linkNode, getWorldNode())
  printFPS()
}

let lastFrameTimestamp: number = Date.now()
function printFPS() {
  const currentFrameTimestamp = Date.now()
  const fps = Math.round(1000 / (currentFrameTimestamp - lastFrameTimestamp))
  figma.ui.postMessage({message: `FPS: ${fps}`})
  lastFrameTimestamp = currentFrameTimestamp
}

figma.showUI(__html__, {height: 160})
figma.ui.postMessage({health: displayHealth(3, 3)})

figma.ui.onmessage = onKeyPressed

figma.on("close", () => {
  getWorldNode().remove()

  const original = figma.currentPage.findOne((node: SceneNode) => node.getPluginData("original-world") === "true")
  if (original) {
    original.visible = true
    original.setPluginData("original-world", "true")
    // figma.currentPage.selection = [linkNode]
  }
})

if (main()) {
  setInterval(nextFrame, 1000 / FPS)
}