import { Link } from "./link"
import { Projectile } from "./actors/projectile"
import { Rectangle, COLLISION_TILES, WATER_TILES, DECORATIVE_TILES } from "./tiles"

export const FPS = 30
export const CAMERA_BOX_SIZE = 150

interface findNodesInWorldResponse {
  items: FrameNode[]
  enemies: FrameNode[]
  link: FrameNode | null
  multiplayerLinks: FrameNode[]
  tiles: InstanceNode[]
}
export const findNodesInWorld = (worldNode: FrameNode) => {
  const response: findNodesInWorldResponse = {
    items: [],
    enemies: [],
    link: null,
    multiplayerLinks: [],
    tiles: [],
  }
  // findAll is an expensive call so we only do it once
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
    if (!node.removed) { // this deals with nested instances
      const name = node.name
      if (name === 'triforce' || name === 'master-sword' || name === 'bow') {
        response.items.push(detachNode(node))
      } else if (COLLISION_TILES.has(name) || WATER_TILES.has(name) || DECORATIVE_TILES.has(name)) {
        response.tiles.push(node)
      } else if (name === 'octorok-red' || name === 'octorok-blue' || name === 'moblin-red' || name === 'moblin-blue' || name === 'lynel-red' || name === 'scarecrow') {
        response.enemies.push(detachNode(node))
      } else if (name === 'link') {
        if (node.getPluginData("player-one") === "true") {
          response.link = detachNode(node)
        } else {
          response.multiplayerLinks.push(detachNode(node))
        }
      }
    }
  })
  return response
}

export interface Invulnerability {
  numFrames: number
  direction: Vector
}

export type Facing = 'up' | 'down' | 'left' | 'right'

export function facingOpposite(f1: Facing, f2: Facing) {
  return f1 === 'up' && f2 === 'down' ||
    f1 === 'down' && f2 === 'up' ||
    f1 === 'left' && f2 === 'right' ||
    f1 === 'right' && f2 === 'left'
}

export interface ClientMessages {
  getBow: boolean,
  getSword: string,
  health: string,
  triforceShards: string,
}

let worldNode: FrameNode
export function setWorldNode(w: FrameNode) {
  worldNode = w
}

export function getWorldNode() {
  return worldNode
}

let worldPosition: Vector
export function setWorldPosition(p: Vector) {
  worldPosition = p
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

const libSpritesPage = figma.root.children.find((node: BaseNode) => node.type === 'PAGE' && node.name === 'lib-sprites')!
export function createNewLibSprite(name: String) {
  const libInstanceNode = libSpritesPage.children.find((node: SceneNode) => node.name === name) as InstanceNode
  if (!libInstanceNode) { throw `could not find lib sprite named ${name}`}
  const libInstanceClone = detachNode(libInstanceNode.clone())

  const insertIndex = 0 // insert to the bottom
  getWorldNode().insertChild(insertIndex, libInstanceClone)
  return libInstanceClone
}

let triforceShardsTotal: number
let triforceShardsCurrent = 0
export function setTriforceShardsTotal(t: number) {
  triforceShardsTotal = t
}

export function incrementTriforceShardsCurrent() {
  triforceShardsCurrent++
  return triforceShardsCurrent === triforceShardsTotal
}

export function displayTriforceShards() {
  let displayTriforceShards = ''
  for (let i = 0; i < triforceShardsCurrent; i++) {
    displayTriforceShards += '<span class="full"></span>'
  }
  for (let i = 0; i < triforceShardsTotal - triforceShardsCurrent; i++) {
    displayTriforceShards += '<span class="empty"></span>'
  }
  return displayTriforceShards
}

export function displayHealth(current: number, total: number) {
  let displayHealth = ''
  for (let i = 0; i < Math.floor(current); i++) {
    displayHealth += '<span class="full"></span>'
  }
  if (current - Math.floor(current) >= .5) {
    displayHealth += '<span class="half"></span>'
  }
  for (let i = 0; i < Math.floor(total - current); i++) {
    displayHealth += '<span class="empty"></span>'
  }
  return displayHealth
}

let currentCenter: Vector = figma.viewport.center
export function updateCamera(linkPosition: Rectangle, cameraBoxSize: number) {
  // TODO: does this take link's width/height into account?
  const distFromCenter = cameraBoxSize / 3.5
  const currentX = linkPosition.x + worldPosition.x
  const currentY = linkPosition.y + worldPosition.y

  let newX = currentCenter.x
  if (currentCenter.x - currentX > distFromCenter) {
    newX -= currentCenter.x - currentX - distFromCenter
  } else if (currentX - currentCenter.x > distFromCenter) {
    newX += currentX - currentCenter.x - distFromCenter
  }

  let newY = currentCenter.y
  if (currentCenter.y - currentY > distFromCenter) {
    newY -= currentCenter.y - currentY - distFromCenter
  } else if (currentY - currentCenter.y > distFromCenter) {
    newY += currentY - currentCenter.y - distFromCenter
  }

  if (newX !== currentCenter.x || newY !== currentCenter.y) {
    currentCenter = {x: newX, y: newY}
    figma.viewport.center = currentCenter
  }
}

// It turns out fetching node data for InstanceNodes is really slow, but fetching
// node data for FrameNodes is pretty fast. This is a helper function to detach
// instances to frames for performance
// Once Plugin API supports detaching, replace this function with the official function
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