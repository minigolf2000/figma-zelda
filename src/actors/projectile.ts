import { Actor } from "./actor"
import { Tiles, Rectangle, CollisionLevel } from "../tiles"
import { Facing, createNewLibSprite } from "../lib"
import { multiply } from "../vector"
import { Sprite } from "../sprite"

const PROJECTILE_SPEED = 4.0
const DAMAGE = 0.5
const LIFESPAN_FRAMES = 100

export class Projectile extends Actor {
  private frames: number = 0

  public constructor(spriteName: string, collision: Tiles, shooterRectangle: Rectangle, facing: Facing) {
    super(createNewLibSprite(spriteName), collision, Infinity, facing)
    this.node.x = shooterRectangle.x + shooterRectangle.width / 2 - this.node.width / 2
    this.node.y = shooterRectangle.y + shooterRectangle.height / 2 - this.node.height / 2
    this.collisionLevel = CollisionLevel.Wall
    this.damage = DAMAGE
  }

  public initialMove() {
    if (this.move(multiply(this.facingVector(), 16))) {
      return this
    }
    this.getNode().remove()
    return null
  }

  public nextFrame() {
    this.frames++
    const successfulMove = this.move(multiply(this.facingVector(), PROJECTILE_SPEED))
    if (this.frames <= LIFESPAN_FRAMES && successfulMove) {
      return this.getCurrentCollision()
    } else {
      this.getNode().remove()
      return null
    }
  }
}

export class Arrow extends Projectile {
  public constructor(collision: Tiles, shooterRectangle: Rectangle, facing: Facing) {
    super('arrow', collision, shooterRectangle, facing)
    new Sprite(this.node, ['basic', this.facing])
  }
}

export class OctorokRock extends Projectile {
  public constructor(collision: Tiles, shooterRectangle: Rectangle, facing: Facing) {
    super('octorok-rock', collision, shooterRectangle, facing)
  }
}