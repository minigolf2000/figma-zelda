import { Facing } from "./lib"
import { Collision } from "./collision"
import { Vector } from "./vector"

export class Actor {
  protected node: InstanceNode
  protected facing: Facing
  private collision: Collision

  public constructor(node: InstanceNode, collision: Collision) {
    this.node = node
    this.facing = 'down'
    this.collision = collision
  }

  protected move(vector: Vector) {
    if (!this.collision.isColliding(this.node.x + vector.x, this.node.y + vector.y)) {
      this.node.x += vector.x
      this.node.y += vector.y
    }
  }

  protected facingVector() {
    switch (this.facing) {
      case 'up':
        return new Vector(0, -1)
      case 'down':
        return new Vector(0, 1)
      case 'left':
        return new Vector(-1, 0)
      case 'right':
        return new Vector(1, 0)
      // default:
      //   assertNever()
    }
  }

}
