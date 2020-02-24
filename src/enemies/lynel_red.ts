import { Sprite } from "../sprite"
import { Tiles } from "../tiles"
import { Actor } from "../actor"
import { multiply, normalize, vectorToFacing } from "../vector"

const MAX_WALK_FRAMES = 28
const HEALTH = 3.0
const WALK_SPEED = 1.5

export class LynelRed extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0

  public constructor(node: InstanceNode, collision: Tiles) {
    super(node, collision, HEALTH)
    this.sprite = new Sprite(node)
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
  }

  public nextFrame(linkNode: SceneNode) {
    if (this.health <= 0) {
      this.getNode().visible = false
      return null
    }
    this.incrementInvulnerability()
    const vector = {x: linkNode.x - this.getNode().x, y: linkNode.y - this.getNode().y}
    this.facing = vectorToFacing(vector)

    this.walkingFrame++
    if (this.walkingFrame === MAX_WALK_FRAMES) this.walkingFrame = 0
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.walkingFrame / 4) % 2])

    const moveVector = multiply(normalize(vector), WALK_SPEED)
    this.move(moveVector)

    return this.getCurrentCollision()
  }
}
