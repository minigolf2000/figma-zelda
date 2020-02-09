import { Vector, rectsToVector } from "./vector"

const COLLISION_TILES = new Set(['tree', 'rock', 'water', 'rock_s'])

export class Collision {
  private walls: {} = {}
  private worldNode: FrameNode

  public constructor(worldNode: FrameNode) {
    this.worldNode = worldNode

    let numNodesSnappedToGrid = 0
    worldNode.children.forEach((node: SceneNode) => {
      if (COLLISION_TILES.has(node.name)) {
        if (node.x % 16 !== 0 || node.y % 16 !== 0) {
          node.x = Math.round(node.x / 16) * 16
          node.y = Math.round(node.y / 16) * 16
          numNodesSnappedToGrid++
        }
        if (!this.walls[node.x]) {this.walls[node.x] = {}}
        this.walls[node.x][node.y] = true
      }
    })

    if (numNodesSnappedToGrid > 0) {
      console.log(`Warning: Snapped ${numNodesSnappedToGrid} nodes to the 16px grid`)
    }
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
    return rectsToVector(rect1, rect2)
  }
  return null
}