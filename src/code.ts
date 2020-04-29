import { FPS, displayHealth, updateCamera, setWorldNode, getWorldNode } from './lib'
import { loadEnemies } from './actors/enemies/enemies'
import { Tiles, isOverlapping, snapTilesToGrid } from './tiles'
import { onKeyPressed, keysPressed, paused } from './buttons'
import { Link } from './link'
import { Actor } from './actors/actor'
import { MasterSword } from './actors/master-sword'
import { Triforce } from './actors/triforce'
import { loadItems } from './actors/items'

let linkNode: InstanceNode
let link: Link
let tiles: Tiles
let enemies: Actor[]
let items: (MasterSword | Triforce)[]
let projectiles: Actor[] = []
let gameWon = false
let gameLost = false

function addProjectile(projectile: Actor) {
  projectiles.push(projectile)
}

function findLinkNode() {
  const isPlayableLink = (node: BaseNode) => node.type === 'INSTANCE' && node.name === 'link' && node.parent?.type !== 'PAGE'
  let firstSelectedNode: (BaseNode & ChildrenMixin) | null = figma.currentPage.selection[0] as BaseNode & ChildrenMixin

  // Search for link starting from Page if no selection
  if (!firstSelectedNode) {
    return figma.currentPage.findOne(node => isPlayableLink(node)) as InstanceNode
  }

  // If selecting an invalid search point, walk up the tree until selecting a valid search point
  while (firstSelectedNode && firstSelectedNode.type !== 'PAGE' && firstSelectedNode.type !== 'FRAME' && firstSelectedNode.name !== 'link') {
    firstSelectedNode = firstSelectedNode.parent!
  }

  // Now we are selecting a valid search point

  // Return this node
  if (isPlayableLink(firstSelectedNode)) {
    return firstSelectedNode as InstanceNode
  }

  // Search for a valid link
  if (firstSelectedNode.type === 'FRAME') {
    return firstSelectedNode.findOne(node => isPlayableLink(node)) as InstanceNode
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
    figma.closePlugin("Could not find a 'link' node inside a frame")
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
  link = new Link(linkNode, tiles, addProjectile)

  figma.ui.postMessage({item: "sword"})

  enemies = loadEnemies(worldNode, tiles, linkNode, addProjectile)
  items = loadItems(worldNode)
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

  if (gameWon) {
    if (!link.winAnimation()) {
      figma.closePlugin()
    }
    return
  }
  if (gameLost) {
    if (!link.deathAnimation()) {
      figma.closePlugin()
    }
    return
  }
  const item = tiles.onItem({x: linkNode.x, y: linkNode.y})
  if (item) {
    link.getItem(item)
    items = items.filter(i => i.node.id !== item.id) // remove from items array
    switch (item.name) {
      case 'triforce':
        gameWon = true
        break
      case 'bow':
        figma.ui.postMessage({addItem: "bow"})
        break
    }
    item.remove()
  }

  const linkHurtbox = link.nextFrame()
  const linkHitbox = link.hitBox()
  projectiles = projectiles.filter((projectile: Actor) => !!projectile.nextFrame(linkNode))

  items.forEach(item => item.nextFrame())

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
      if (health <= 0) { gameLost = true }
    }

    // link damages enemies
    if (linkHitbox) {
      const hitVector = isOverlapping(enemyHitbox, linkHitbox)
      if (hitVector) {
        enemy.takeDamage(link.getDamage(), hitVector)
      }
    }

    projectiles = projectiles.filter((projectile: Actor) => {

      // projectiles damage link
      const hurtVector = isOverlapping(linkHurtbox, projectile.getNode())
      if (hurtVector) {
        if (!link.isShielding(projectile)) {
          const health = link.takeDamage(projectile.getDamage(), hurtVector)
          if (health <= 0) { gameLost = true }
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