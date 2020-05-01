import { Sprite } from "../../sprite"
import { Facing } from "../../lib"
import { Tiles } from "../../tiles"
import { Actor } from "../actor"
import { multiply } from "../../vector"

const MAX_WALK_FRAMES = 28
const RED_HEALTH = 1.0
const BLUE_HEALTH = 1.5
const WALK_SPEED = 1.25
const DAMAGE = 0.5
class Moblin extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0

  public constructor(node: FrameNode, collision: Tiles, health: number) {
    super(node, collision, health, 'down')
    this.sprite = new Sprite(node, ['basic', 'down', 0])
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
    this.damage = DAMAGE
  }

  public nextFrame() {
    if (this.health <= 0) {
      this.getNode().remove()
      return null
    }
    this.incrementInvulnerability()
    if (this.walkingFrame === 0) {
      const choices: Facing[] = ['up', 'down', 'left', 'right']
      this.facing = choices[Math.floor(Math.random() * choices.length)]
    }

    this.walkingFrame++
    if (this.walkingFrame === MAX_WALK_FRAMES) this.walkingFrame = 0
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.walkingFrame / 4) % 2])

    if (this.walkingFrame < 16) {
      this.move(multiply(this.facingVector(), WALK_SPEED))
    }

    return this.getCurrentCollision()
  }
}

export class MoblinRed extends Moblin {
  public constructor(node: FrameNode, collision: Tiles) {
    super(node, collision, RED_HEALTH)
  }
}
export class MoblinBlue extends Moblin {
  public constructor(node: FrameNode, collision: Tiles) {
    super(node, collision, BLUE_HEALTH)
  }
}