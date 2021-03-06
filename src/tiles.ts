import { normalize, direction } from "./vector"

export const COLLISION_TILES = new Set(['tree', 'rock', 'rock_se', 'wall', 'rock_sw', 'rock_ne', 'rock_n', 'rock_nw'])
export const WATER_TILES = new Set(['water'])
export const DECORATIVE_TILES = new Set(['dirt', 'bridge', 'stairs'])
export enum CollisionLevel {
  Water = 1, // blocks ground units
  Wall = 2 // blocks ground units and air units
}

interface Walls {
  [x: number]: {
    [y: number]: CollisionLevel
  }
}

let tiles: Tiles
export function getTiles() {
  return tiles
}

export class Tiles {
  private walls: Walls = {}
  private worldNode: FrameNode
  private worldWidth: number
  private worldHeight: number

  public constructor(worldNode: FrameNode, tileNodes: InstanceNode[]) {
    this.worldNode = worldNode
    this.worldWidth = worldNode.width
    this.worldHeight = worldNode.height

    const tilesFrame = figma.createFrame()
    tilesFrame.name = "collision tiles"
    tilesFrame.resize(worldNode.width, worldNode.height)
    tilesFrame.fills = []

    tileNodes.forEach((node: InstanceNode) => {
      if (COLLISION_TILES.has(node.name)) {
        if (!this.walls[node.x]) {this.walls[node.x] = {}}
        this.walls[node.x][node.y] = CollisionLevel.Wall
        tilesFrame.appendChild(node)
      }

      if (WATER_TILES.has(node.name)) {
        if (!this.walls[node.x]) {this.walls[node.x] = {}}
        this.walls[node.x][node.y] = CollisionLevel.Water
        tilesFrame.appendChild(node)
      }

      if (DECORATIVE_TILES.has(node.name)) {
        tilesFrame.appendChild(node)
      }
      return false
    })

    worldNode.appendChild(tilesFrame)

    this.rasterizeTiles(tilesFrame)

    tiles = this
  }

  private async rasterizeTiles(tilesFrame: FrameNode) {
    const backgroundFill: SolidPaint = {
      type: "SOLID",
      color: {r: 252 / 255, g: 216 / 255, b: 168 / 255}
    }
    const rasterizedPaintFill: ImagePaint = {
      type: "IMAGE",
      scaleMode: "FILL",
      imageHash: figma.createImage(await tilesFrame.exportAsync()).hash,
    }

    this.worldNode.fills = [backgroundFill, rasterizedPaintFill]
    tilesFrame.visible = false
    tilesFrame.remove()
  }

  //
  public getMovePositionRespectingCollision(rect: Rectangle, vector: Vector, collisionLevel: CollisionLevel) {
    const newMoveX = this.getMovePositionRespectingCollision1D(rect.x, rect.x + rect.width, vector.x, (x) => this.isColliding(x, rect.y) >= collisionLevel || this.isColliding(x, rect.y + rect.height - 1) >= collisionLevel)
    const newMoveY = this.getMovePositionRespectingCollision1D(rect.y, rect.y + rect.height, vector.y, (y) => this.isColliding(rect.x, y) >= collisionLevel || this.isColliding(rect.x + rect.width - 1, y) >= collisionLevel)

    return {x: newMoveX, y: newMoveY}
  }

  public getMovePositionRespectingCollision1D(left: number, right: number, move: number, isCollidingFunc: (coord: number) => boolean) {
    if (move > 0) {
      if (isCollidingFunc(right + move)) {
        return Math.ceil((left + move) / 16) * 16 - (right - left) - 1
      }
      return left + move
    }
    if (move < 0) {
      if (isCollidingFunc(left + move)) {
        return Math.ceil((left + move) / 16) * 16
      }
      return left + move
    }
    return left
  }

  // make this take a rect and move vector?
  private isColliding(x: number, y: number) {
    if (x < 0 || y < 0 || x > this.worldWidth || y > this.worldHeight) {
      return true
    }
    return (
      this.walls[Math.floor((x) / 16) * 16]?.[Math.floor((y) / 16) * 16]
    )
  }
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

/* If rectangles are overlapping, return a normal Vector from rect1 to rect 2
 * Else return null
 */
export function isOverlapping(rect1: Rectangle, rect2: Rectangle): Vector | null {
  if (rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  ) {
    return normalize(direction(rect1, rect2))
  }
  return null
}

// Return a vector representing the midpoint of the rectangle
export function midpoint(r: Rectangle): Vector {
  return {x: r.x + r.width / 2, y: r.y + r.height / 2}
}

export function snapTilesToGrid(worldNode: FrameNode) {
  let numTilesSnappedToGrid = 0

  worldNode.children.forEach((node: SceneNode) => {
    const snappedX = Math.round(node.x / 16) * 16 + Math.round((16 - node.width) / 2)
    const snappedY = Math.round(node.y / 16) * 16 + Math.round((16 - node.height) / 2)
    if (snappedX !== node.x || snappedY !== node.y || node.rotation !== 0) {
      node.x = snappedX
      node.y = snappedY
      node.rotation = 0
      numTilesSnappedToGrid++
    }
  })

  if (numTilesSnappedToGrid > 0) {
    figma.notify(`${numTilesSnappedToGrid} tiles snapped to the 16px grid`)
  }
}


export function lintWorld(worldNode: FrameNode) {
  // ensure no tiles in types COLLISION_TILES, WATER_TILES, or DECORATIVE_TILES overlap
  const tiles: {[position: string]: boolean} = {}
  const warnings: {[position: string]: boolean} = {}

  worldNode.children.forEach((node: SceneNode) => {
    if (COLLISION_TILES.has(node.name) || WATER_TILES.has(node.name) || DECORATIVE_TILES.has(node.name)) {
      const positionString = `${node.x}, ${node.y}`
      if (tiles[positionString]) {
        warnings[positionString] = true
      }
      tiles[positionString] = true
    }
  })
  if (Object.keys(warnings).length > 0) {
    figma.notify(`Warning: Please fix overlapping tiles at (${Object.keys(warnings).join(") & (")})`)
  }
}
