import { Facing, KNOCKBACK_MAGNITUDE, Invulnerability } from "../lib"
import { Tiles, Rectangle } from "../tiles"
import { multiply, add } from "../vector"

export abstract class Actor {
  protected node: InstanceNode
  public facing: Facing
  protected collision: Tiles
  protected health: number
  private invulnerability: Invulnerability | null = null
  protected projectiles: Actor[]
  protected addProjectile: (projectile: Actor) => void
  protected damage: number

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

  public getDamage() {
    return this.damage
  }

  public getHealth() {
    return this.health
  }

  protected move(vector: Vector) {
    const newPosition = this.collision.moveToPositionRespectingCollision(this.node, vector)
    const successfulMove = this.node.x + vector.x === newPosition.x && this.node.y + vector.y === newPosition.y

    this.node.x = newPosition.x
    this.node.y = newPosition.y

    return successfulMove
  }

  public takeDamage(damage: number, vector: Vector) {
    if (this.invulnerability !== null) {
      return this.health
    }
    this.health = Math.max(0, this.health - damage)
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

  abstract nextFrame(linkNode: SceneNode): Rectangle | null

}
