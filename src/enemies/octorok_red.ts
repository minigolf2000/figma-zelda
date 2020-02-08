import { Sprite } from "../sprite"
import { Facing, vector } from "../lib"
import { Collision } from "../collision"

const MAX_WALK_FRAMES = 12
export class OctorokRed {
  private node: InstanceNode
  private sprite: Sprite
  private walkingFrame: number = 0
  private facing: Facing
  private collision: Collision

  public constructor(node: InstanceNode, collision: Collision) {
    this.node = node
    this.sprite = new Sprite(node)
    this.facing = 'down'
    this.collision = collision
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
  }

  public nextFrame() {
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
      const myVector = vector(this.facing).map(n => n * 2)
      if (!this.collision.isColliding(this.node.x + myVector[0], this.node.y + myVector[1])) {
        this.node.x += myVector[0]
        this.node.y += myVector[1]
      }
    }

    return {x: this.node.x, y: this.node.y, width: 16, height: 16}
  }
}
