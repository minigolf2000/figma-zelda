import { Actor } from "./actor"
import { Tiles, Rectangle } from "../tiles"
import { Facing, createNewLibSprite } from "../lib"
import { multiply } from "../vector"
import { Sprite } from "../sprite"
const ARROW_SPEED = 4.0
export class Arrow extends Actor {
  private frames: number = 0

  public constructor(collision: Tiles, shooterRectangle: Rectangle, facing: Facing) {
    super(createNewLibSprite('arrow'), collision, Infinity, facing)
    new Sprite(this.node, ['basic', this.facing])
    this.node.x = shooterRectangle.x + shooterRectangle.width / 2 - this.node.width / 2
    this.node.y = shooterRectangle.y + shooterRectangle.height / 2 - this.node.height / 2
    // this.damage = DAMAGE
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
    const successfulMove = this.move(multiply(this.facingVector(), ARROW_SPEED))
    if (this.frames <= 100 && successfulMove) {
      return this.getCurrentCollision()
    } else {
      this.getNode().remove()
      return null
    }
  }
}
