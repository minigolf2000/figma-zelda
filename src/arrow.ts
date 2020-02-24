import { Actor } from "./actor"
import { Tiles } from "./tiles"
import { Facing, createNewLibSprite } from "./lib"
import { multiply } from "./vector"
import { Sprite } from "./sprite"
const ARROW_SPEED = 4.0
export class Arrow extends Actor {
  private sprite: Sprite
  private frames: number = 0

  public constructor(collision: Tiles, position: Vector, facing: Facing) {
    super(createNewLibSprite('arrow'), collision, Infinity, facing)
    this.sprite = new Sprite(this.node)
    this.node.x = position.x - this.node.width / 2
    this.node.y = position.y - this.node.height / 2
    this.sprite.setSprite(['basic', this.facing])
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
