import { Sprite } from "../../sprite"
import { Facing } from "../../lib"
import { Actor } from "../actor"
import { multiply, vectorToFacing, facingToVector } from "../../vector"

const MAX_WALK_FRAMES = 40
const RED_HEALTH = 1.0
const BLUE_HEALTH = 1.5
const WALK_SPEED = 1.25
const DAMAGE = 0.5
class Moblin extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0

  public constructor(node: FrameNode, health: number) {
    super(node, health, 'down')
    this.sprite = new Sprite(node, ['basic', 'down', 0])
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
    this.damage = DAMAGE
  }

  public nextFrame() {
    if (this.health <= 0) {
      this.getNode().remove()
      return false
    }
    this.incrementInvulnerability()
    if (this.walkingFrame === 0) {
      if (Math.random() < 0.8) {
        this.facing = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Facing
      } else {
        // Every once in a while, walk toward home
        this.facing = vectorToFacing({x: this.homeVector.x - this.node.x, y: this.homeVector.y - this.node.y})
      }
    }

    this.walkingFrame++
    if (this.walkingFrame === MAX_WALK_FRAMES) this.walkingFrame = 0
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.walkingFrame / 4) % 2])

    if (this.walkingFrame < 20) {
      this.move(multiply(facingToVector(this.facing), WALK_SPEED))
    }

    return true
  }
}

export class MoblinRed extends Moblin {
  public constructor(node: FrameNode) {
    super(node, RED_HEALTH)
  }
}
export class MoblinBlue extends Moblin {
  public constructor(node: FrameNode) {
    super(node, BLUE_HEALTH)
  }
}