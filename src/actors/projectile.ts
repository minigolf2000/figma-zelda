import { Actor } from "./actor"
import { CollisionLevel } from "../tiles"
import { Facing, createNewLibSprite } from "../lib"
import { multiply, facingToVector } from "../vector"
import { Sprite } from "../sprite"

const PROJECTILE_SPEED = 4.0
const DAMAGE = 0.5
const BOW_DAMAGE = 0.25
const LIFESPAN_FRAMES = 100

export class Projectile extends Actor {
  private frames: number = 0

  public constructor(spriteName: string, shooter: Actor, facing: Facing) {
    super(createNewLibSprite(shooter.getNode(), spriteName), Infinity, facing)
    const shooterCollision = shooter.getCurrentCollision()
    this.node.x = shooterCollision.x + shooterCollision.width / 2 - this.node.width / 2
    this.node.y = shooterCollision.y + shooterCollision.height / 2 - this.node.height / 2
    this.setCurrentPosition({x: this.node.x, y: this.node.y})
    this.collisionLevel = CollisionLevel.Wall
    this.damage = DAMAGE
  }

  public initialMove() {
    if (this.move(multiply(facingToVector(this.facing), 16))) {
      return this
    } else {
      this.getNode().remove()
      return null
    }
  }

  public nextFrame() {
    this.frames++
    const successfulMove = this.move(multiply(facingToVector(this.facing), PROJECTILE_SPEED))
    if (this.frames <= LIFESPAN_FRAMES && successfulMove) {
      return true
    } else {
      this.getNode().remove()
      return false
    }
  }
}

export class Arrow extends Projectile {
  public constructor(shooter: Actor, facing: Facing) {
    super('arrow', shooter, facing)
    new Sprite(this.node, ['basic', this.facing])
    this.damage = BOW_DAMAGE
  }

  public knockbackFacing() {
    // Arrows do no knockback
    return null
  }
}

export class OctorokRock extends Projectile {
  public constructor(shooter: Actor, facing: Facing) {
    super('octorok-rock', shooter, facing)
  }
}