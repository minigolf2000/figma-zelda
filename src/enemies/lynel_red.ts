import { Sprite } from "../sprite"
import { Facing } from "../lib"
import { Tiles } from "../tiles"
import { Actor } from "../actor"
import { Vector } from "../vector"

const MAX_WALK_FRAMES = 28
const HEALTH = 1.0
const WALK_SPEED = 2.0

export class LynelRed extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0

  public constructor(node: InstanceNode, collision: Tiles) {
    super(node, collision, HEALTH)
    this.sprite = new Sprite(node)
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
  }

  public nextFrame(linkNode: SceneNode) {
    this.incrementInvulnerability()
    const vector = {x: linkNode.x - this.getNode().x, y: linkNode.y - this.getNode().y}
    if (this.walkingFrame === 0) {
      const choices: Facing[] = ['up', 'down', 'left', 'right']
      this.facing = choices[Math.floor(Math.random() * choices.length)]
    }

    this.walkingFrame++
    if (this.walkingFrame === MAX_WALK_FRAMES) this.walkingFrame = 0
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.walkingFrame / 4) % 2])

    this.move((new Vector(vector.x, vector.y)).normalize().multiply(WALK_SPEED))

    return this.getCurrentCollision()
  }
}
