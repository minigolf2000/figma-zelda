import { Sprite } from "../../sprite"
import { Actor } from "../actor"
import { multiply, normalize, vectorToFacing, distance, magnitude } from "../../vector"
import { getLink } from "../../lib"
import { midpoint } from "../../tiles"

const MAX_WALK_FRAMES = 28
const HEALTH = 3.0
const WALK_SPEED = 1.5
const DAMAGE = 1.0

const PURSUIT_DISTANCE = 120 // Distance at which Lynel will start chasing Link

export class LynelRed extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0
  private forcedMove: {
    vector: Vector,
    numFrames: number,
  } | null

  public constructor(node: FrameNode) {
    super(node, HEALTH)
    this.sprite = new Sprite(node, ['down', 0])
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
    this.damage = DAMAGE
  }

  // Lynels have special move behavior where they will try to "wiggle" their way
  // around obstacles. When detecting it runs into a wall, it will set
  // forcedMove to the orthogonal direction
  protected move(vector: Vector) {
    if (this.forcedMove) {
      super.move(this.forcedMove.vector)

      if (this.forcedMove.numFrames === 8) {
        this.forcedMove = null
      } else {
        this.forcedMove.numFrames++
      }
      return null
    }

    const blockedVector = super.move(vector)

    if (blockedVector) {
      // If Lynel detects it ran into a wall, set forcedMove
      if (blockedVector.x !== 0) {
        if (vector.y > 0) {
          this.forcedMove = {vector: {x: 0, y: WALK_SPEED}, numFrames: 0}
        } else if (vector.y < 0) {
          this.forcedMove = {vector: {x: 0, y: -WALK_SPEED}, numFrames: 0}
        }
      }
      if (blockedVector.y !== 0) {
        if (vector.x > 0) {
          this.forcedMove = {vector: {x: WALK_SPEED, y: 0}, numFrames: 0}
        } else if (vector.x < 0) {
          this.forcedMove = {vector: {x: -WALK_SPEED, y: 0}, numFrames: 0}
        }
      }

    }

    return blockedVector
  }

  public nextFrame() {
    const linkCollision = getLink().getCurrentCollision()
    if (this.health <= 0) {
      this.getNode().remove()
      return false
    }
    this.incrementInvulnerability()

    const destination = (distance(this.homeVector, midpoint(linkCollision)) > PURSUIT_DISTANCE) ?
      {x: this.homeVector.x - this.getCurrentCollision().width / 2, y: this.homeVector.y - this.getCurrentCollision().height / 2} : // Go home
      {x: midpoint(linkCollision).x - this.getCurrentCollision().width / 2, y: midpoint(linkCollision).y - this.getCurrentCollision().height / 2} // Chase Link


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
