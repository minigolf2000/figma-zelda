import { Facing, KNOCKBACK_DISTANCE } from "./lib"
import { Collision, Rectangle } from "./collision"
import { Vector } from "./vector"

export abstract class Actor {
  private node: InstanceNode
  protected facing: Facing
  private collision: Collision
  private health: number
  private invulnerabilityFrame: number | null = null

  public constructor(node: InstanceNode, collision: Collision, health: number) {
    this.node = node
    this.facing = 'down'
    this.collision = collision
    this.health = health
  }

  public getNode() {
    return this.node
  }

  protected move(vector: Vector) {
    if (!this.collision.isColliding(this.node.x + vector.x, this.node.y + vector.y)) {
      this.node.x += vector.x
      this.node.y += vector.y
    }
  }

  public takeDamage(vector: Vector) {
    if (this.invulnerabilityFrame !== null) {
      return this.health
    }
    this.invulnerabilityFrame = 0
    this.health -= 0.5
    this.move(vector.multiply(KNOCKBACK_DISTANCE))
    return this.health
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

  protected incrementInvulnerabilityFrames() {
    if (this.invulnerabilityFrame !== null) {
      this.invulnerabilityFrame++
      if (this.invulnerabilityFrame && this.invulnerabilityFrame % 2 === 0) {
        this.node.visible = !this.node.visible
      }
      if (this.invulnerabilityFrame === 20) {
        this.node.visible = true
        this.invulnerabilityFrame = null
      }
    }
  }

  abstract nextFrame(): Rectangle;

}
