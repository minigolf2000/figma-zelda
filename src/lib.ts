import { Link } from "./link"
import { Projectile } from "./actors/projectile"

export const FPS = 30
export const KNOCKBACK_MAGNITUDE = 16.0

export interface Invulnerability {
  numFrames: number
  knockback: Vector
}

export type Facing = 'up' | 'down' | 'left' | 'right'

export function facingOpposite(f1: Facing, f2: Facing) {
  return f1 === 'up' && f2 === 'down' ||
    f1 === 'down' && f2 === 'up' ||
    f1 === 'left' && f2 === 'right' ||
    f1 === 'right' && f2 === 'left'
}


let worldNode: FrameNode
export function setWorldNode(w: FrameNode) {
  worldNode = w
}

export function getWorldNode() {
  return worldNode
}

let link: Link
export function setLink(l: Link) {
  link = l
}
export function getLink() {
  return link
}


let projectiles: Projectile[] = []
export function setProjectiles(l: Projectile[]) {
  projectiles = l
}
export function getProjectiles() {
  return projectiles
}

export function addProjectile(projectile: Projectile | null) {
  if (projectile) {
    projectiles.push(projectile)
  }
}


const libSpritesPage = figma.root.findOne((node: BaseNode) => node.type === 'PAGE' && node.name === 'lib-sprites') as PageNode
export function createNewLibSprite(name: String) {
  const libInstanceNode = (libSpritesPage.findOne((node: SceneNode) => node.name === name) as InstanceNode)
  if (!libInstanceNode) { throw `could not find lib sprite named ${name}`}
  const libInstanceClone = detachNode(libInstanceNode.clone())

  const insertIndex = 0 // insert to the bottom
  getWorldNode().insertChild(insertIndex, libInstanceClone)
  return libInstanceClone
}

export function displayHealth(current: number, max: number) {
  const missing = max - current
  let displayHealth = ''
  while (current >= 1) {
    displayHealth += '<span class="full"></span>'
    current -= 1
  }
  if (current >= .5) {
    displayHealth += '<span class="half"></span>'
  }
  Array.from(Array(Math.floor(missing))).forEach((x, i) => {
    displayHealth += '<span class="empty"></span>'
  })
  return displayHealth
}

export function updateCamera(linkNode: SceneNode, worldNode: FrameNode) {
  const distFromCenter = 300 / figma.viewport.zoom
  const currentX = linkNode.x + worldNode.x
  const currentY = linkNode.y + worldNode.y

  let newX = figma.viewport.center.x
  if (figma.viewport.center.x - currentX > distFromCenter) {
    newX -= figma.viewport.center.x - currentX - distFromCenter
  } else if (currentX - figma.viewport.center.x > distFromCenter) {
    newX += currentX - figma.viewport.center.x - distFromCenter
  }

  let newY = figma.viewport.center.y
  if (figma.viewport.center.y - currentY > distFromCenter) {
    newY -= figma.viewport.center.y - currentY - distFromCenter
  } else if (currentY - figma.viewport.center.y > distFromCenter) {
    newY += currentY - figma.viewport.center.y - distFromCenter
  }

  if (newX !== figma.viewport.center.x || newY !== figma.viewport.center.y) {
    figma.viewport.center = {x: newX, y: newY}
  }
}

export function rotation(facing: Facing) {
  switch (facing) {
    case 'up':
      return 0
    case 'left':
      return 90
    case 'down':
      return 180
    case 'right':
      return 270
  }
}

// It turns out fetching node data for InstanceNodes is really slow, but fetching
// node data for FrameNodes is pretty fast. This is a helper function to detach
// instances to frames for performance
// Once Plugin API support detaching, replace this function with the official function
export function detachNode(node: InstanceNode) {
  const detached = figma.createFrame()
  detached.name = node.name
  detached.x = node.x
  detached.y = node.y
  detached.fills = node.fills
  detached.clipsContent = node.clipsContent
  detached.resize(node.width, node.height)
  node.parent?.appendChild(detached)
  node.children.forEach(c => detached.appendChild(c.clone()))
  node.remove()
  return detached
}