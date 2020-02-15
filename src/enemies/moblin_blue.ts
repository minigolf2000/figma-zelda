import { Sprite } from "../sprite"
import { Facing } from "../lib"
import { Tiles } from "../tiles"
import { Actor } from "../actor"

const MAX_WALK_FRAMES = 14
const HEALTH = 1.0
const WALK_SPEED = 1.5
export class MoblinBlue extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0

  public constructor(node: InstanceNode, collision: Tiles) {
    super(node, collision, HEALTH)
    this.sprite = new Sprite(node)
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
  }

  public nextFrame() {
    this.incrementInvulnerability()
    if (this.walkingFrame === 0) {
      const choices: Facing[] = ['up', 'down', 'left', 'right']
      this.facing = choices[Math.floor(Math.random() * choices.length)]
    }

    this.walkingFrame++
    if (this.walkingFrame === MAX_WALK_FRAMES) this.walkingFrame = 0
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.walkingFrame / 4) % 2])

    if (this.walkingFrame < 8) {
      this.move(this.facingVector().multiply(WALK_SPEED))
    }

    return this.getCurrentCollision()
  }
}
