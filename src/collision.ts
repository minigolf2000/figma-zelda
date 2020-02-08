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
      this.walls[Math.floor(x / 16) * 16]?.[Math.floor(y / 16) * 16] ||
      this.walls[Math.floor(x / 16) * 16]?.[Math.ceil(y / 16) * 16] ||
      this.walls[Math.ceil(x / 16) * 16]?.[Math.floor(y / 16) * 16] ||
      this.walls[Math.ceil(x / 16) * 16]?.[Math.ceil(y / 16) * 16]
    )
  }
}