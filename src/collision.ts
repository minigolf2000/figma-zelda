const COLLISION_TILES = new Set(['tree', 'rock', 'water', 'rock_s'])

export class Collision {
  private walls: {} = {}
  private worldNode: FrameNode

  public constructor(worldNode: FrameNode) {
    this.worldNode = worldNode
    worldNode.children.forEach((node: SceneNode) => {
      if (COLLISION_TILES.has(node.name)) {
        if (!this.walls[node.x]) {this.walls[node.x] = {}}
        this.walls[node.x][node.y] = true
      }
    })
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

export function isOverlapping(rect1: Rectangle, rect2: Rectangle) {
  return (rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y)
}