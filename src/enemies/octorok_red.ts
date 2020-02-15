import { Sprite } from "../sprite"
import { Facing, createNewLibSprite } from "../lib"
import { Tiles } from "../tiles"
import { Actor } from "../actor"

const MAX_WALK_FRAMES = 28
const HEALTH = 1.0
const WALK_SPEED = 1.0
const ROCK_SPEED = 4.0

class Rock extends Actor {
  private frames: number = 0
  public constructor(collision: Tiles, position: Vector, facing: Facing) {
    super(createNewLibSprite('octorok-rock'), collision, Infinity, facing)
    this.node.x = position.x
    this.node.y = position.y
  }

  public nextFrame() {
    this.frames++
    const successfulMove = this.move(this.facingVector().multiply(ROCK_SPEED))
    if (this.frames <= 100 && successfulMove) {
      return this.getCurrentCollision()
    } else {
      this.getNode().remove()
      return null
    }
  }
}

export class OctorokRed extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0
  private addProjectile: (projectile: Actor) => void

  public constructor(node: InstanceNode, collision: Tiles, addProjectile: (projectile: Actor) => void) {
    super(node, collision, HEALTH)
    this.sprite = new Sprite(node)
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
    this.addProjectile = addProjectile
  }

  public nextFrame() {
    this.incrementInvulnerabilityFrames()
    if (this.walkingFrame === 0) {
      const choices: Facing[] = ['up', 'down', 'left', 'right']
      this.facing = choices[Math.floor(Math.random() * choices.length)]
    }

    this.walkingFrame++
    if (this.walkingFrame === MAX_WALK_FRAMES) this.walkingFrame = 0
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.walkingFrame / 4) % 2])

    this.move(this.facingVector().multiply(WALK_SPEED))
    if (this.walkingFrame === MAX_WALK_FRAMES - 1) {
      this.addProjectile(new Rock(this.collision, this.getProjectileStartPosition(), this.facing))
      this.move(this.facingVector().multiply(WALK_SPEED))
    }

    return this.getCurrentCollision()
  }
}
