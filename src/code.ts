import { FPS, displayHealth, updateCamera, setWorldNode, getWorldNode, setLink, getLink, setProjectiles, getProjectiles, displayTriforceShards, setTriforceShardsTotal, CAMERA_BOX_SIZE, setWorldPosition, findNodesInWorld } from './lib'
import { loadEnemies } from './actors/enemies/enemies'
import { Tiles, isOverlapping, snapTilesToGrid, setTiles, lintWorld } from './tiles'
import { onKeyPressed, keysPressed, paused } from './buttons'
import { Link } from './link'
import { Actor } from './actors/actor'
import { Items, getItems, setItems } from './actors/items'

let templateWorldNode: FrameNode
let enemies: Actor[]
let gameLost = false

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

const findNearestFrameAncestor = (node: BaseNode) => {
  let current: any = node
  while (current) {
    if (current.type === 'FRAME') { return current }
    current = current.parent
  }
}

function main() {
  let templateLinkNode = findLinkNode()
  if (!templateLinkNode) {
    figma.closePlugin("Please have Link selected while running the Plugin")
    return false
  }

  templateWorldNode = findNearestFrameAncestor(templateLinkNode)
  if (templateWorldNode.getPluginData("running-world") ===  "true") {
    figma.closePlugin("Multiplayer is not supported yet!")
    return false
  }

  snapTilesToGrid(templateWorldNode)
  lintWorld(templateWorldNode)
  templateWorldNode.visible = false
  templateLinkNode.setPluginData("player-one", "true")

  const worldNode = templateWorldNode.clone()
  worldNode.setPluginData("running-world", "true")
  setWorldNode(worldNode)
  worldNode.visible = true

  const nodesInWorld = findNodesInWorld(worldNode)
  setTiles(new Tiles(worldNode, nodesInWorld.tiles))
  setItems(new Items(nodesInWorld.items))
  setTriforceShardsTotal(getItems().triforceShardTotal())
  enemies = loadEnemies(nodesInWorld.enemies)

  setLink(new Link(nodesInWorld.link!))
  templateLinkNode.setPluginData("player-one", "") // reset this to initial value

  figma.currentPage.setRelaunchData({relaunch: ''})
  templateWorldNode.setRelaunchData({relaunch: ''})
  figma.currentPage.selection = []

  figma.viewport.zoom = 3.5
  setWorldPosition(getWorldNode())
  updateCamera(getLink().getCurrentCollision(), 0)

  return true
}

function nextFrame() {
  const link = getLink()
  const linkNode = link.getCurrentCollision()
  const items = getItems()

  if (paused) {
    return
  }
  if (keysPressed.esc) {
    figma.closePlugin()
    return
  }

  if (link.winAnimationFrame !== null) {
    enemies.forEach(e => e.getNode().remove())
    enemies = []
    if (!link.winAnimation()) {
      figma.closePlugin()
    }
    return
  }
  if (gameLost) {
    enemies.forEach(e => e.getNode().remove())
    enemies = []
    if (!link.deathAnimation()) {
      figma.closePlugin()
    }
    return
  }
  items.getIfOverlapping(link, linkNode)
  items.nextFrame()

  link.nextFrame()
  const linkHurtbox = link.getCurrentCollision()
  const linkHitbox = link.hitBox()

  // move projectiles
  setProjectiles(getProjectiles().filter(projectile => !!projectile.nextFrame()))

  enemies.forEach(enemy => enemy.nextFrame())

  enemies = enemies.filter((enemy: Actor) => {
    const enemyHitbox = enemy.getCurrentCollision()

    // enemy damages link
    const hurtVector = isOverlapping(linkHurtbox, enemyHitbox)
    if (hurtVector) {
      const health = link.takeDamage(enemy.getDamage(), hurtVector)
      if (health <= 0) { gameLost = true }
    }

    // link damages enemy
    if (linkHitbox) {
      const hitVector = isOverlapping(enemyHitbox, linkHitbox)
      if (hitVector) {
        const enemyHealth = enemy.takeDamage(link.getDamage(), link.facingVector())
        if (enemyHealth <= 0) {
          return false
        }
      }
    }

    let enemyKilledByProjectile = false
    setProjectiles(getProjectiles().filter((projectile: Actor) => {
      // projectiles damage enemy
      const hitVector = isOverlapping(enemyHitbox, projectile.getCurrentCollision())
      if (hitVector) {
        const enemyHealth = enemy.takeDamage(projectile.getDamage(), projectile.facingVector())
        if (enemyHealth <= 0) {
          enemyKilledByProjectile = true
        }
        projectile.getNode().remove()
        return false
      }
      return true
    }))
    return !enemyKilledByProjectile
  })

  setProjectiles(getProjectiles().filter((projectile: Actor) => {
    // projectiles damage link
    const hurtVector = isOverlapping(linkHurtbox, projectile.getCurrentCollision())
    if (hurtVector) {
      if (!link.isShielding(projectile)) {
        const health = link.takeDamage(projectile.getDamage(), hurtVector)
        if (health <= 0) { gameLost = true }
      }
      projectile.getNode().remove()
      return false
    }
    return true
  }))


  updateCamera(linkNode, CAMERA_BOX_SIZE)
  // printFPS()
}

let lastFrameTimestamp: number = Date.now()
export function printFPS() {
  const currentFrameTimestamp = Date.now()
  const fps = Math.round(1000 / (currentFrameTimestamp - lastFrameTimestamp))
  lastFrameTimestamp = currentFrameTimestamp
  console.info(`fps: ${fps}`)
}

figma.on("close", () => {
  if (getWorldNode()) getWorldNode().remove()
  if (templateWorldNode) templateWorldNode.visible = true
})

if (main()) {
  figma.showUI(__html__, {width: 260, height: 160})
  figma.ui.postMessage({health: displayHealth(3, 3)})
  figma.ui.postMessage({triforceShards: displayTriforceShards()})
  figma.ui.postMessage({setSword: 'wooden-sword'})
  figma.ui.onmessage = onKeyPressed

  setInterval(nextFrame, 1000 / FPS)
}