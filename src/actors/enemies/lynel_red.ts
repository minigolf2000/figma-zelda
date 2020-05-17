import { Sprite } from "../../sprite"
import { Actor } from "../actor"
import { multiply, normalize, vectorToFacing, distance, magnitude } from "../../vector"
import { getLink } from "../../lib"

const MAX_WALK_FRAMES = 28
const HEALTH = 3.0
const WALK_SPEED = 1.5
const DAMAGE = 1.0

const PURSUIT_DISTANCE = 120 // Distance at which Lynel will start chasing Link

export class LynelRed extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0

  public constructor(node: FrameNode) {
    super(node, HEALTH)
    this.sprite = new Sprite(node, ['down', 0])
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
    this.damage = DAMAGE
  }

  public nextFrame() {
    const linkNode = getLink().getCurrentCollision()
    if (this.health <= 0) {
      this.getNode().remove()
      return false
    }
    this.incrementInvulnerability()

    const destination = (distance(this.homeVector, {x: linkNode.x, y: linkNode.y}) > PURSUIT_DISTANCE) ?
      this.homeVector : // Go home
      {x: linkNode.x, y: linkNode.y} // Chase Link


    const vector = {x: destination.x - this.getCurrentCollision().x, y: destination.y - this.getCurrentCollision().y}
    if (magnitude(vector) < 1) {
      // Lynel is already at home
      this.facing = 'down'
      this.sprite.setSprite(['down', 0])
      return true
    }

    this.facing = vectorToFacing(vector)

    this.walkingFrame++
    if (this.walkingFrame === MAX_WALK_FRAMES) this.walkingFrame = 0
    this.sprite.setSprite([this.facing, Math.floor(this.walkingFrame / 4) % 2])

    const moveVector = multiply(normalize(vector), WALK_SPEED)
    this.move(moveVector)

    return true
  }
}
