import { Sprite } from "./sprite"
import { Tiles, Rectangle } from "./tiles"
import { Actor } from "./actor"
import { rotation } from "./lib"
import { keysPressed, changeFacing, getMovementDirection } from "./buttons"
import { multiply } from "./vector"

const HEALTH = 3.0
const WALK_SPEED = 2.5

export class Link extends Actor {
  private walkingFrame: number = 0
  private swordActiveFrame: number | null = null
  private swordNode: SceneNode
  private sprite: Sprite
  private hasBowAndArrow: boolean = false

  public constructor(node: InstanceNode, collision: Tiles, swordNode: InstanceNode) {
    super(node, collision, HEALTH)
    this.sprite = new Sprite(node)
    this.walkingFrame = 0
    this.swordNode = swordNode
    this.swordNode.visible = false
  }

  public hitBoxes() {
    const leniency = 1
    const hitBoxes: Rectangle[] = []
    if (this.swordNode.visible) {
      hitBoxes.push({
        x: this.swordNode.x - leniency,
        y: this.swordNode.y + leniency,
        width: this.swordNode.width + leniency,
        height: this.swordNode.height + leniency,
      })
    }
    return hitBoxes
  }

  public getItem(item: string) {
    if (item === 'bow') {
      this.hasBowAndArrow = true
    }
    console.log(this.hasBowAndArrow)
  }

  public nextFrame() {
    this.incrementInvulnerability()
    if (keysPressed.action && this.swordNode && this.swordActiveFrame === null) {
      this.swordActiveFrame = 0
    }

    let walking = false
    if (this.swordActiveFrame === null) {
      this.facing = changeFacing(this.facing)
      const direction = getMovementDirection()
      walking = direction.x !== 0 || direction.y !== 0
      this.move(multiply(direction, WALK_SPEED))
      this.sprite.setSprite(['basic', this.facing, walking && this.walkingFrame > 2 ? 1 : 0])
    }

    // Increment state
    if (walking) {
      if (this.walkingFrame === 3) this.walkingFrame = 0
      else this.walkingFrame++
    }
    const node = this.getNode()
    if (this.swordActiveFrame !== null && this.swordNode) {
      switch (this.swordActiveFrame) {
        case 0:
          this.sprite.setSprite(['action', this.facing])
          this.swordNode.visible = true
          this.swordNode.rotation = rotation(this.facing)
          if (this.facing === 'up') {
            this.swordNode.x = node.x + 3
            this.swordNode.y = node.y - 12
          } else if (this.facing === 'right') {
            this.swordNode.x = node.x + 27
            this.swordNode.y = node.y + 6
          } else if (this.facing === 'down') {
            this.swordNode.x = node.x + 12
            this.swordNode.y = node.y + 27
          } else if (this.facing === 'left') {
            this.swordNode.x = node.x - 11
            this.swordNode.y = node.y + 13
          }
          this.swordActiveFrame++
          break
        case 1:
          this.swordActiveFrame++
          break
        case 2:
          if (this.facing === 'up') {
            this.swordNode.x = node.x + 3
            this.swordNode.y = node.y - 11
          } else if (this.facing === 'right') {
            this.swordNode.x = node.x + 23
            this.swordNode.y = node.y + 6
          } else if (this.facing === 'down') {
            this.swordNode.x = node.x + 12
            this.swordNode.y = node.y + 23
          } else if (this.facing === 'left') {
            this.swordNode.x = node.x - 7
            this.swordNode.y = node.y + 13
          }
          this.sprite.setSprite(['basic', this.facing, 1])
          this.swordActiveFrame++
          break
        case 3:
          if (this.facing === 'up') {
            this.swordNode.x = node.x + 3
            this.swordNode.y = node.y - 3
          } else if (this.facing === 'right') {
            this.swordNode.x = node.x + 19
            this.swordNode.y = node.y + 6
          } else if (this.facing === 'down') {
            this.swordNode.x = node.x + 12
            this.swordNode.y = node.y + 19
          } else if (this.facing === 'left') {
            this.swordNode.x = node.x - 4
            this.swordNode.y = node.y + 13
          }
          this.sprite.setSprite(['basic', this.facing, 0])
          this.swordActiveFrame++
          break
        default: // >= 4
          this.swordActiveFrame = null
          this.swordNode.visible = false
          break
      }

    }

    const leniency = 1
    return {
      x: this.getNode().x + leniency,
      y: this.getNode().y + leniency,
      width: 16 - leniency,
      height: 16 - leniency,
    }

  }
}
