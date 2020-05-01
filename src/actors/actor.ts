import { Facing, KNOCKBACK_MAGNITUDE, Invulnerability } from "../lib"
import { Tiles, Rectangle, CollisionLevel } from "../tiles"
import { multiply } from "../vector"

export abstract class Actor {
  protected node: FrameNode
  public facing: Facing
  protected collision: Tiles
  protected health: number
  private invulnerability: Invulnerability | null = null
  protected projectiles: Actor[]
  protected damage: number
  protected collisionLevel: CollisionLevel

  public constructor(node: FrameNode, collision: Tiles, health: number, facing: Facing = 'down') {
    this.node = node
    this.collision = collision
    this.health = health
    this.facing = facing
    this.collisionLevel = CollisionLevel.Water
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
    const newPosition = this.collision.moveToPositionRespectingCollision(this.node, vector, this.collisionLevel)
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
      default:
        throw 'Invalid facing'
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

  abstract nextFrame(): Rectangle | null

}
