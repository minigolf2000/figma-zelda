import { Facing, Invulnerability, getLink } from "../lib"
import { CollisionLevel, getTiles, Rectangle } from "../tiles"
import { multiply } from "../vector"
import { getItems } from "./items"

export abstract class Actor {
  protected node: FrameNode // TODO: make this private and expose a delete function?
  public facing: Facing
  protected health: number
  private invulnerability: Invulnerability | null = null
  protected projectiles: Actor[]
  protected damage: number
  protected collisionLevel: CollisionLevel
  protected invulnerabilityKnockbackDuration = 9
  protected invulnerabilityKnockbackMagnitude = 6.0
  protected homeVector: Vector
  private currentPosition: Vector // repeatedly accessing Figma node objects is slow. store this value locally
  private width: number
  private height: number


  public constructor(node: FrameNode, health: number, facing: Facing = 'down') {
    this.node = node
    this.currentPosition = {x: node.x, y: node.y}
    this.width = node.width
    this.height = node.height
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

  public getCurrentCollision(): Rectangle {
    return {...this.currentPosition, width: this.width, height: this.height}
  }

  public setCurrentPosition(position: Vector) {
    this.currentPosition = position

    this.node.x = position.x
    this.node.y = position.y
  }

  protected move(vector: Vector) {
    const currentCollision = this.getCurrentCollision()
    const newPosition = getTiles().getMovePositionRespectingCollision(currentCollision, vector, this.collisionLevel)
    const isSuccessfulMove = currentCollision.x + vector.x === newPosition.x && currentCollision.y + vector.y === newPosition.y

    this.setCurrentPosition(newPosition)
    return isSuccessfulMove
  }

  public takeDamage(damage: number, direction: Vector | null) {
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

  // Compute the direction in which knockback should occur when this actor
  // damages another actor
  public knockbackFacing(): Facing | null {
    return this.facing
  }

  protected onDeath() {
    if (getLink().health < 3 && Math.random() < 0.25) getItems().spawnHeart(this.node)
    this.node.remove()
  }

  protected incrementInvulnerability() {
    if (this.invulnerability === null) {
      return
    }

    if (this.invulnerability.numFrames % 2 === 0) {
      this.node.visible = !this.node.visible
    }
    if (this.invulnerability.direction && this.invulnerability.numFrames < this.invulnerabilityKnockbackDuration) {
      this.move(multiply(this.invulnerability.direction, this.invulnerabilityKnockbackMagnitude))
    }
    if (this.invulnerability.numFrames === 20) {
      this.node.visible = true
      this.invulnerability = null
    } else {
      this.invulnerability.numFrames++
    }
  }

  abstract nextFrame(): boolean

}
