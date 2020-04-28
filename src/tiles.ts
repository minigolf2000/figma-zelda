import { normalize, direction } from "./vector"

const ITEM_TILES = new Set(['triforce', 'bow'])
const COLLISION_TILES = new Set(['tree', 'rock', 'water', 'rock_se', 'rock_s', 'rock_sw', 'rock_ne', 'rock_n', 'rock_nw'])

interface Items {
  [x: number]: {
    [y: number]: SceneNode | null
  }
}
interface Walls {
  [x: number]: {
    [y: number]: boolean
  }
}

export class Tiles {
  private walls: Walls = {}
  private items: Items = {}
  private worldNode: FrameNode

  public constructor(worldNode: FrameNode) {
    this.worldNode = worldNode

    const tilesFrame = figma.createFrame()
    tilesFrame.name = "collision tiles"
    tilesFrame.resize(worldNode.width, worldNode.height)
    tilesFrame.fills = []

    worldNode.findAll((node: SceneNode) => {
      if (ITEM_TILES.has(node.name)) {
        if (!this.items[node.x]) {this.items[node.x] = {}}
        this.items[node.x][node.y] = node
      }

      if (COLLISION_TILES.has(node.name)) {
        if (!this.walls[node.x]) {this.walls[node.x] = {}}
        this.walls[node.x][node.y] = true
        tilesFrame.appendChild(node)
      }
      return false
    })

    worldNode.appendChild(tilesFrame)

    this.rasterizeTiles(tilesFrame)
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

    // TODO: this call is async currently, causing flicker on game start. can we fix the flash?
    this.worldNode.fills = [backgroundFill, rasterizedPaintFill]
    tilesFrame.visible = false
    tilesFrame.remove()
  }

  public isColliding(x: number, y: number) {
    if (x < 0 || y < 0 || x > this.worldNode.width - 16 || y > this.worldNode.height - 16) {
      return true
    }
    return (
      this.walls[Math.floor((x+1) / 16) * 16]?.[Math.floor((y+1) / 16) * 16] ||
      this.walls[Math.floor((x+1) / 16) * 16]?.[Math.ceil((y-1) / 16) * 16] ||
      this.walls[Math.ceil((x-1) / 16) * 16]?.[Math.floor((y+1) / 16) * 16] ||
      this.walls[Math.ceil((x-1) / 16) * 16]?.[Math.ceil((y-1) / 16) * 16]
    )
  }

  public onItem(linkVector: Vector) {
    const {x, y} = linkVector
    const item = (
      this.items[Math.floor((x+1) / 16) * 16]?.[Math.floor((y+1) / 16) * 16] ||
      this.items[Math.floor((x+1) / 16) * 16]?.[Math.ceil((y-1) / 16) * 16] ||
      this.items[Math.ceil((x-1) / 16) * 16]?.[Math.floor((y+1) / 16) * 16] ||
      this.items[Math.ceil((x-1) / 16) * 16]?.[Math.ceil((y-1) / 16) * 16]
    )
    if (item) {
      this.items[item.x][item.y] = null
    }
    return item
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

export function snapTilesToGrid(worldNode: FrameNode) {
  let numNodesSnappedToGrid = 0

  worldNode.children.forEach((node: SceneNode) => {
    if (node.x % 16 !== 0 || node.y % 16 !== 0) {
      node.x = Math.round(node.x / 16) * 16
      node.y = Math.round(node.y / 16) * 16
      numNodesSnappedToGrid++
    }
  })

  if (numNodesSnappedToGrid > 0) {
    figma.notify(`${numNodesSnappedToGrid} tiles snapped to the 16px grid`)
  }
}