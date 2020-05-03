import { Facing, Invulnerability, getLink } from "../lib"
import { Rectangle, CollisionLevel, getTiles } from "../tiles"
import { multiply } from "../vector"
import { getItems } from "./items"

export abstract class Actor {
  protected node: FrameNode
  public facing: Facing
  protected health: number
  private invulnerability: Invulnerability | null = null
  protected projectiles: Actor[]
  protected damage: number
  protected collisionLevel: CollisionLevel
  protected invulnerabilityKnockbackDuration = 9
  protected invulnerabilityKnockbackMagnitude = 6.0
  protected homeVector: Vector

  public constructor(node: FrameNode, health: number, facing: Facing = 'down') {
    this.node = node
    this.health = health
    this.facing = facing
    this.collisionLevel = CollisionLevel.Water
    this.homeVector = {x: node.x, y: node.y}
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
    const newPosition = getTiles().moveToPositionRespectingCollision(this.node, vector, this.collisionLevel)
    const successfulMove = this.node.x + vector.x === newPosition.x && this.node.y + vector.y === newPosition.y

    this.node.x = newPosition.x
    this.node.y = newPosition.y

    return successfulMove
  }

  public takeDamage(damage: number, direction: Vector) {
    if (this.invulnerability !== null) {
      return this.health
    }
    this.health = Math.max(0, this.health - damage)
    if (this.health === 0) {
      this.onDeath()
    }
    this.invulnerability = {numFrames: 0, direction}
    return this.health
  }

  protected onDeath() {
    if (getLink().health < 3 && Math.random() < 0.25) getItems().spawnHeart(this.node)
    this.node.remove()
  }

  public facingVector() {
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
    if (this.invulnerability === null) {
      return
    }

    if (this.invulnerability.numFrames % 2 === 0) {
      this.node.visible = !this.node.visible
    }
    if (this.invulnerability.numFrames < this.invulnerabilityKnockbackDuration) {
      this.move(multiply(this.invulnerability.direction, this.invulnerabilityKnockbackMagnitude))
    }
    if (this.invulnerability.numFrames === 20) {
      this.node.visible = true
      this.invulnerability = null
    } else {
      this.invulnerability.numFrames++
    }
  }

  protected getCurrentCollision() {
    const {x, y, width, height} = this.getNode()
    return {x, y, width, height}
  }

  abstract nextFrame(): Rectangle | null

}
