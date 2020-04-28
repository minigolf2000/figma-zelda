import { Sprite } from "./sprite"
import { Tiles } from "./tiles"
import { Actor } from "./actor"
import { rotation, displayHealth, facingOpposite } from "./lib"
import { keysPressed, changeFacing, getMovementDirection } from "./buttons"
import { multiply } from "./vector"
import { Arrow } from "./arrow"

const HEALTH = 3.0
const WALK_SPEED = 2.5

export class Link extends Actor {
  private walkingFrame: number = 0
  private swordActiveFrame: number | null = null
  private bowActiveFrame: number | null = null
  private swordNode: SceneNode
  private sprite: Sprite
  private hasBowAndArrow: boolean = false

  public constructor(node: InstanceNode, collision: Tiles, swordNode: InstanceNode, addProjectile: (projectile: Actor) => void) {
    super(node, collision, HEALTH, 'down', addProjectile)
    this.sprite = new Sprite(node)
    this.walkingFrame = 0
    this.swordNode = swordNode
    this.swordNode.visible = false
  }

  public hitBox() {
    const leniency = 1
    if (this.swordNode.visible) {
      return {
        x: this.swordNode.x - leniency,
        y: this.swordNode.y + leniency,
        width: this.swordNode.width + leniency,
        height: this.swordNode.height + leniency,
      }
    }
    return null
  }

  public getItem(item: string) {
    if (item === 'bow') {
      this.hasBowAndArrow = true
    }
  }

  public takeDamage(damage: number, vector: Vector) {
    const health = super.takeDamage(damage, vector)

    if (health > 0) {
      figma.ui.postMessage({health: displayHealth(health, 3)})
    } else {
      figma.closePlugin()
    }
    return health
  }

  public isShielding(projectile: Actor) {
    return this.swordActiveFrame === null && this.bowActiveFrame === null && facingOpposite(this.facing, projectile.facing)
  }

  public nextFrame() {
    this.incrementInvulnerability()
    if (keysPressed.x && this.swordNode && this.swordActiveFrame === null && this.bowActiveFrame === null) {
      this.swordActiveFrame = 0
    }
    if (keysPressed.z && this.hasBowAndArrow && this.swordActiveFrame === null && this.bowActiveFrame === null) {
      this.bowActiveFrame = 0
    }

    let walking = false
    if (this.swordActiveFrame === null) {
      if (this.bowActiveFrame === null) {
        this.facing = changeFacing(this.facing)
      }
      const direction = getMovementDirection()
      walking = direction.x !== 0 || direction.y !== 0
      if (walking) {
        this.move(multiply(direction, WALK_SPEED))
      }
      this.sprite.setSprite(['basic', this.facing, walking && this.walkingFrame > 2 ? 1 : 0])
    }

    // Increment state
    if (walking) {
      if (this.walkingFrame === 3) this.walkingFrame = 0
      else this.walkingFrame++
    }
    if (this.swordActiveFrame !== null && this.swordNode) {
      this.setSwordPosition(this.swordActiveFrame)
      this.swordActiveFrame++
      if (this.swordActiveFrame > 4) {
        this.swordActiveFrame = null
      }
    }
    if (this.bowActiveFrame !== null) {
      this.doBowStuff(this.bowActiveFrame)
      this.bowActiveFrame++
      if (this.bowActiveFrame > 10) {
        this.bowActiveFrame = null
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

  private doBowStuff(frame: number) {
    if (frame === 5) {
      this.addProjectile(new Arrow(this.collision, this.getProjectileStartPosition(), this.facing))
    }
  }

  private setSwordPosition(frame: number) {
    const node = this.getNode()
    switch (frame) {
      case 0:
        this.sprite.setSprite(['action', this.facing])
        this.swordNode.visible = true
        this.swordNode.rotation = rotation(this.facing)
        if (this.facing === 'up') {
          this.swordNode.x = node.x + 3; this.swordNode.y = node.y - 12;
        } else if (this.facing === 'right') {
          this.swordNode.x = node.x + 27; this.swordNode.y = node.y + 6;
        } else if (this.facing === 'down') {
          this.swordNode.x = node.x + 12; this.swordNode.y = node.y + 27;
        } else if (this.facing === 'left') {
          this.swordNode.x = node.x - 11; this.swordNode.y = node.y + 13;
        }
        break
      case 2:
        if (this.facing === 'up') {
          this.swordNode.x = node.x + 3; this.swordNode.y = node.y - 11
        } else if (this.facing === 'right') {
          this.swordNode.x = node.x + 23; this.swordNode.y = node.y + 6
        } else if (this.facing === 'down') {
          this.swordNode.x = node.x + 12; this.swordNode.y = node.y + 23
        } else if (this.facing === 'left') {
          this.swordNode.x = node.x - 7; this.swordNode.y = node.y + 13
        }
        this.sprite.setSprite(['basic', this.facing, 1])
        break
      case 3:
        if (this.facing === 'up') {
          this.swordNode.x = node.x + 3; this.swordNode.y = node.y - 3
        } else if (this.facing === 'right') {
          this.swordNode.x = node.x + 19; this.swordNode.y = node.y + 6
        } else if (this.facing === 'down') {
          this.swordNode.x = node.x + 12; this.swordNode.y = node.y + 19
        } else if (this.facing === 'left') {
          this.swordNode.x = node.x - 4; this.swordNode.y = node.y + 13
        }
        this.sprite.setSprite(['basic', this.facing, 0])
        break
      case 4:
        this.swordNode.visible = false
      default:
        break
    }
  }
}
