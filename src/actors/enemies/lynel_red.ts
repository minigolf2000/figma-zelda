import { Sprite } from "../../sprite"
import { Tiles } from "../../tiles"
import { Actor } from "../actor"
import { multiply, normalize, vectorToFacing, distance, magnitude } from "../../vector"
import { getLink } from "../../lib"

const MAX_WALK_FRAMES = 28
const HEALTH = 3.0
const WALK_SPEED = 1.5
const DAMAGE = 1.0

const PURSUIT_DISTANCE = 120

export class LynelRed extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0
  private homeVector: Vector

  public constructor(node: InstanceNode, collision: Tiles) {
    super(node, collision, HEALTH)
    this.sprite = new Sprite(node, ['basic', 'down', 0])
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
    this.homeVector = {x: node.x, y: node.y}
    this.damage = DAMAGE
  }

  public nextFrame() {
    const linkNode = getLink().getNode()
    if (this.health <= 0) {
      this.getNode().remove()
      return null
    }
    this.incrementInvulnerability()

    let destination = {x: linkNode.x, y: linkNode.y}
    if (distance(this.homeVector, {x: linkNode.x, y: linkNode.y}) > PURSUIT_DISTANCE) {
      destination = this.homeVector
    }

    const vector = {x: destination.x - this.getNode().x, y: destination.y - this.getNode().y}
    if (magnitude(vector) < 1) {
      // Lynel is already at home
      return this.getCurrentCollision()
    }

    this.facing = vectorToFacing(vector)

    this.walkingFrame++
    if (this.walkingFrame === MAX_WALK_FRAMES) this.walkingFrame = 0
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.walkingFrame / 4) % 2])

    const moveVector = multiply(normalize(vector), WALK_SPEED)
    this.move(moveVector)

    return this.getCurrentCollision()
  }
}
