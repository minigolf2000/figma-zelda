import { Actor } from "./actor"
import { CollisionLevel, Rectangle } from "../tiles"
import { Facing, createNewLibSprite } from "../lib"
import { multiply, facingToVector } from "../vector"
import { Sprite } from "../sprite"

const PROJECTILE_SPEED = 4.0
const DAMAGE = 0.5
const BOW_DAMAGE = 0.25
const LIFESPAN_FRAMES = 100

export class Projectile extends Actor {
  private frames: number = 0

  public constructor(spriteName: string, shooterCollision: Rectangle, shooterNode: FrameNode, facing: Facing) {
    super(createNewLibSprite(shooterNode, spriteName, facing === 'up' ? 0 : undefined), Infinity, facing)

    const x = shooterCollision.x + shooterCollision.width / 2 - this.node.width / 2
    const y = shooterCollision.y + shooterCollision.height / 2 - this.node.height / 2

    this.setCurrentPosition({x, y})
    this.node.x = x
    this.node.y = y

    this.collisionLevel = CollisionLevel.Wall
    this.damage = DAMAGE
  }

  public initialMove(magnitude: number) {
    if (this.move(multiply(facingToVector(this.facing), magnitude))) {
      return this
    } else {
      this.getNode().remove()
      return null
    }
  }

  public nextFrame() {
    this.frames++
    const isObstructed = this.move(multiply(facingToVector(this.facing), PROJECTILE_SPEED))
    if (this.frames <= LIFESPAN_FRAMES && !isObstructed) {
      return true
    } else {
      this.getNode().remove()
      return false
    }
  }
}

export class Arrow extends Projectile {
  public constructor(shooter: Actor) {
    const shooterCollision = shooter.getCurrentCollision()
    if (shooter.facing !== 'up') shooterCollision.y -= 2
    super('arrow', shooterCollision, shooter.getNode(), shooter.facing)

    new Sprite(this.node, [this.facing])
    this.damage = BOW_DAMAGE

    this.initialMove(10)
  }

  public knockbackFacing() {
    // Arrows do no knockback
    return null
  }
}

export class OctorokRock extends Projectile {
  public constructor(shooter: Actor) {
    super('octorok-rock', shooter.getCurrentCollision(), shooter.getNode(), shooter.facing)
    this.initialMove(16)
  }
}