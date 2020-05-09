import { FPS, displayHealth, updateCamera, setWorldNode, getWorldNode, setLink, getLink, setProjectiles, getProjectiles, detachNode, displayTriforceShards, setTriforceShardsTotal, CAMERA_BOX_SIZE } from './lib'
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

function main() {
  let linkNodeOrNull = findLinkNode()
  if (!linkNodeOrNull) {
    figma.closePlugin("Please have Link selected while running the Plugin")
    return false
  }

  if (!linkNodeOrNull.parent || linkNodeOrNull.parent.type !== 'FRAME') {
    figma.closePlugin("Could not find a 'link' node inside a frame")
    return false
  }

  templateWorldNode = linkNodeOrNull.parent
  if (templateWorldNode.getPluginData("running-world") ===  "true") {
    figma.closePlugin("Multiplayer is not supported yet!")
    return false
  }

  snapTilesToGrid(templateWorldNode)
  lintWorld(templateWorldNode)
  templateWorldNode.visible = false

  const worldNode = templateWorldNode.clone()
  worldNode.setPluginData("running-world", "true")
  setWorldNode(worldNode)
  worldNode.visible = true
  figma.currentPage.selection = [worldNode] // used to find the correct linkNode
  linkNodeOrNull = findLinkNode()!
  linkNodeOrNull.masterComponent.setRelaunchData({relaunch: ''})

  setTiles(new Tiles(worldNode))

  setItems(new Items(worldNode))
  setTriforceShardsTotal(getItems().triforceShardTotal())
  enemies = loadEnemies(worldNode)
  setLink(new Link(detachNode(linkNodeOrNull)))

  figma.currentPage.setRelaunchData({relaunch: ''})
  worldNode.setRelaunchData({relaunch: ''})
  figma.currentPage.selection = []
  figma.viewport.zoom = 3.5
  updateCamera(getLink().getNode(), getWorldNode(), 0)

  return true
}

function nextFrame() {
  const link = getLink()
  const linkNode = link.getNode()
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
      const hitVector = isOverlapping(enemyHitbox, projectile.getNode())
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
    const hurtVector = isOverlapping(linkHurtbox, projectile.getNode())
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


  updateCamera(linkNode, getWorldNode(), CAMERA_BOX_SIZE)
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
  getWorldNode().remove()
  templateWorldNode.visible = true
})

if (main()) {
  figma.showUI(__html__, {width: 260, height: 160})
  figma.ui.postMessage({health: displayHealth(3, 3)})
  figma.ui.postMessage({triforceShards: displayTriforceShards()})
  figma.ui.postMessage({setSword: 'wooden-sword'})
  figma.ui.onmessage = onKeyPressed

  setInterval(nextFrame, 1000 / FPS)
}