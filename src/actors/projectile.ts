import { Actor } from "./actor"
import { Rectangle, CollisionLevel } from "../tiles"
import { Facing, createNewLibSprite } from "../lib"
import { multiply } from "../vector"
import { Sprite } from "../sprite"

const PROJECTILE_SPEED = 4.0
const DAMAGE = 0.5
const BOW_DAMAGE = 0.25
const LIFESPAN_FRAMES = 100

export class Projectile extends Actor {
  private frames: number = 0

  public constructor(spriteName: string, shooterRectangle: Rectangle, facing: Facing) {
    super(createNewLibSprite(spriteName), Infinity, facing)
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
      return true
    } else {
      this.getNode().remove()
      return false
    }
  }
}

export class Arrow extends Projectile {
  public constructor(shooterRectangle: Rectangle, facing: Facing) {
    super('arrow', shooterRectangle, facing)
    new Sprite(this.node, ['basic', this.facing])
    this.damage = BOW_DAMAGE
  }
}

export class OctorokRock extends Projectile {
  public constructor(shooterRectangle: Rectangle, facing: Facing) {
    super('octorok-rock', shooterRectangle, facing)
  }
}