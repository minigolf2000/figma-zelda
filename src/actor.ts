import { Facing, KNOCKBACK_MAGNITUDE, Invulnerability } from "./lib"
import { Tiles, Rectangle } from "./tiles"
import { Vector } from "./vector"

export abstract class Actor {
  protected node: InstanceNode
  protected facing: Facing
  protected collision: Tiles
  private health: number
  private invulnerability: Invulnerability | null = null
  protected projectiles: Actor[]

  public constructor(node: InstanceNode, collision: Tiles, health: number, facing: Facing = 'down') {
    this.node = node
    this.collision = collision
    this.health = health
    this.facing = facing
  }

  public getNode() {
    return this.node
  }

  protected move(vector: Vector) {
    if (!this.collision.isColliding(this.node.x + vector.x, this.node.y + vector.y)) {
      this.node.x += vector.x
      this.node.y += vector.y
      return true
    }
    return false
  }

  public takeDamage(vector: Vector) {
    if (this.invulnerability !== null) {
      return this.health
    }
    this.health -= 0.5
    this.invulnerability = {numFrames: 0, knockback: vector.multiply(KNOCKBACK_MAGNITUDE)}
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

  protected incrementInvulnerability() {
    if (this.invulnerability !== null) {
      this.invulnerability.numFrames++
      if (this.invulnerability && this.invulnerability.numFrames % 2 === 0) {
        this.node.visible = !this.node.visible
      }
      if (this.invulnerability.numFrames < 4) {
        this.move(this.invulnerability.knockback)
      }
      if (this.invulnerability.numFrames === 20) {
        this.node.visible = true
        this.invulnerability = null
      }
    }
  }

  protected getCurrentCollision() {
    const {x, y, width, height} = this.getNode()
    return {x, y, width, height}
  }

  protected getProjectileStartPosition() {
    const {x, y, width, height} = this.getNode()
    const center = (new Vector(x, y)).add(new Vector(width / 2, height / 2))
    return center.add(this.facingVector().multiply(8))
  }

  abstract nextFrame(linkNode: SceneNode): Rectangle | null;

}
