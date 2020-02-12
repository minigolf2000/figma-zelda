import { Sprite } from "../sprite"
import { Facing } from "../lib"
import { Collision } from "../collision"
import { Actor } from "../actor"

const MAX_WALK_FRAMES = 12
export class OctorokRed extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0

  public constructor(node: InstanceNode, collision: Collision) {
    super(node, collision, 1)
    this.sprite = new Sprite(node)
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
  }

  public nextFrame() {
    this.actorNextFrame()
    if (this.walkingFrame === 0) {
      const choices: Facing[] = ['up', 'down', 'left', 'right']
      this.facing = choices[Math.floor(Math.random() * choices.length)]
    }

    this.walkingFrame++
    if (this.walkingFrame === MAX_WALK_FRAMES) this.walkingFrame = 0

    if (this.walkingFrame < 8) {
      // if (this.node.rotation !== rotation(this.facing)) {
      //   this.node.rotation = rotation(this.facing)
      // }
      this.sprite.setSprite(['basic', this.facing, this.walkingFrame > 5 ? 1 : 0])
      this.move(this.facingVector().multiply(2))
    }

    return {x: this.getNode().x, y: this.getNode().y, width: 16, height: 16}
  }
}
