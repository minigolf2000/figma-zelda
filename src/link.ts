import { Sprite } from "./sprite"
import { Collision } from "./collision"
import { Actor } from "./actor"
import { KNOCKBACK_DISTANCE, WALK_SPEED, rotation } from "./lib"
import { Vector } from "./vector"
import { keysPressed, changeFacing, getMovementDirection } from "./buttons"

export class Link extends Actor {
  private health: number = 3
  private walkingFrame: number = 0
  private invulnerabilityFrame: number | null = null
  private swordActiveFrame: number | null = null
  private swordNode: SceneNode | null = null
  private sprite: Sprite

  public constructor(node: InstanceNode, collision: Collision, swordNode: InstanceNode) {
    super(node, collision)
    this.sprite = new Sprite(node)
    this.walkingFrame = 0
    this.swordNode = swordNode
    this.swordNode.visible = false
  }

  public takeDamage(vector: Vector) {
    if (this.invulnerabilityFrame !== null) {
      return this.health
    }
    this.invulnerabilityFrame = 0
    this.health -= 0.5
    this.move(vector.multiply(KNOCKBACK_DISTANCE))
    return this.health
  }

  public nextFrame() {
    if (keysPressed.action && this.swordNode && this.swordActiveFrame === null) {
      this.swordActiveFrame = 0
    }

    let walking = false
    if (this.swordActiveFrame === null) {
      this.facing = changeFacing(this.facing)
      const direction = getMovementDirection()
      walking = direction.x !== 0 || direction.y !== 0
      this.move(direction.multiply(WALK_SPEED))
      this.sprite.setSprite(['basic', this.facing, walking && this.walkingFrame > 2 ? 1 : 0])
    }

    // Increment state
    if (walking) {
      if (this.walkingFrame === 3) this.walkingFrame = 0
      else this.walkingFrame++
    }
    if (this.swordActiveFrame !== null && this.swordNode) {
      switch (this.swordActiveFrame) {
        case 0:
          this.sprite.setSprite(['action', this.facing])
          this.swordNode.visible = true
          this.swordNode.rotation = rotation(this.facing)
          if (this.facing === 'up') {
            this.swordNode.x = this.node.x + 3
            this.swordNode.y = this.node.y - 12
          } else if (this.facing === 'right') {
            this.swordNode.x = this.node.x + 27
            this.swordNode.y = this.node.y + 6
          } else if (this.facing === 'down') {
            this.swordNode.x = this.node.x + 12
            this.swordNode.y = this.node.y + 27
          } else if (this.facing === 'left') {
            this.swordNode.x = this.node.x - 11
            this.swordNode.y = this.node.y + 13
          }
          this.swordActiveFrame++
          break
        case 1:
          this.swordActiveFrame++
          break
        case 2:
          if (this.facing === 'up') {
            this.swordNode.x = this.node.x + 3
            this.swordNode.y = this.node.y - 11
          } else if (this.facing === 'right') {
            this.swordNode.x = this.node.x + 23
            this.swordNode.y = this.node.y + 6
          } else if (this.facing === 'down') {
            this.swordNode.x = this.node.x + 12
            this.swordNode.y = this.node.y + 23
          } else if (this.facing === 'left') {
            this.swordNode.x = this.node.x - 7
            this.swordNode.y = this.node.y + 13
          }
          this.sprite.setSprite(['basic', this.facing, 1])
          this.swordActiveFrame++
          break
        case 3:
          if (this.facing === 'up') {
            this.swordNode.x = this.node.x + 3
            this.swordNode.y = this.node.y - 3
          } else if (this.facing === 'right') {
            this.swordNode.x = this.node.x + 19
            this.swordNode.y = this.node.y + 6
          } else if (this.facing === 'down') {
            this.swordNode.x = this.node.x + 12
            this.swordNode.y = this.node.y + 19
          } else if (this.facing === 'left') {
            this.swordNode.x = this.node.x - 4
            this.swordNode.y = this.node.y + 13
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

    if (this.invulnerabilityFrame !== null) {
      this.invulnerabilityFrame++
      if (this.invulnerabilityFrame && this.invulnerabilityFrame % 2 === 0) {
        this.node.visible = !this.node.visible
      }
      if (this.invulnerabilityFrame === 20) {
        this.node.visible = true
        this.invulnerabilityFrame = null
      }
    }
  }
}
