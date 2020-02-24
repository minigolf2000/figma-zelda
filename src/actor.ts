import { Facing, KNOCKBACK_MAGNITUDE, Invulnerability } from "./lib"
import { Tiles, Rectangle } from "./tiles"
import { multiply, add } from "./vector"

export abstract class Actor {
  protected node: InstanceNode
  protected facing: Facing
  protected collision: Tiles
  protected health: number
  private invulnerability: Invulnerability | null = null
  protected projectiles: Actor[]
  protected addProjectile: (projectile: Actor) => void

  public constructor(node: InstanceNode, collision: Tiles, health: number, facing: Facing = 'down', addProjectile?: (projectile: Actor) => void) {
    this.node = node
    this.collision = collision
    this.health = health
    this.facing = facing
    this.addProjectile = addProjectile || (() => {})
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
    this.invulnerability = {numFrames: 0, knockback: multiply(vector, KNOCKBACK_MAGNITUDE)}
    return this.health
  }

  protected facingVector() {
    switch (this.facing) {
      case 'up':
        return {x: 0, y: -1}
      case 'down':
        return {x: 0, y: 1}
      case 'left':
        return {x: -1, y: 0}
      case 'right':
        return {x: 1, y: 0}
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
    const center = {x: x + width / 2, y: y + height / 2}
    return add(center, multiply(this.facingVector(), 8))
  }

  abstract nextFrame(linkNode: SceneNode): Rectangle | null;

}
