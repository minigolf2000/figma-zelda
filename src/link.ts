import { Sprite } from "./sprite"
import { Tiles } from "./tiles"
import { Actor } from "./actors/actor"
import { rotation, facingOpposite, createNewLibSprite, getWorldNode, addProjectile } from "./lib"
import { keysPressed, changeFacing, getMovementDirection } from "./buttons"
import { multiply } from "./vector"
import { Arrow } from "./actors/projectile"

const HEALTH = 3.0
const WALK_SPEED = 2.5
const WOODEN_SWORD_DAMAGE = 0.5
const MASTER_SWORD_DAMAGE = 1.0

export class Link extends Actor {
  private walkingFrame: number = 0
  private swordActiveFrame: number | null = null
  private bowActiveFrame: number | null = null
  private swordNode: SceneNode
  private sprite: Sprite
  private hasBowAndArrow: boolean = false
  private hasMasterSword: boolean = false

  public constructor(node: FrameNode, collision: Tiles) {
    super(node, collision, HEALTH, 'down')
    this.sprite = new Sprite(node, ['basic', 'down', 0])
    this.walkingFrame = 0
    this.swordNode = createNewLibSprite('wooden-sword')
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

  public getItem(item: SceneNode) {
    if (item.name === 'bow') {
      this.hasBowAndArrow = true
    }
    if (item.name === 'triforce') {
      this.winAnimationFrame =  0
    }
    if (item.name === 'master-sword') {
      this.swordNode.remove()
      this.swordNode = createNewLibSprite('master-sword')
      this.swordNode.visible = false
      this.hasMasterSword = true
    }
  }

  public getDamage() {
    return this.hasMasterSword ? MASTER_SWORD_DAMAGE : WOODEN_SWORD_DAMAGE
  }

  public isShielding(projectile: Actor) {
    return this.swordActiveFrame === null && this.bowActiveFrame === null && facingOpposite(this.facing, projectile.facing)
  }

  private deathAnimationFrame = 0
  public deathAnimation() {
    if (this.deathAnimationFrame <= 30) {
      if (this.deathAnimationFrame % 2 === 0) {
        this.node.visible = !this.node.visible
      }
      this.sprite.setSprite(['basic', 'down', Math.floor(this.deathAnimationFrame / 4) % 2 ])
    }
    if (this.deathAnimationFrame === 38) {
      const redFill: SolidPaint = {
        type: "SOLID",
        color: {r: 216 / 255, g: 40 / 255, b: 0 / 255},
        opacity: .2
      }
      getWorldNode().fills = [...getWorldNode().fills as readonly Paint[], redFill]
    }
    if (this.deathAnimationFrame > 38 && this.deathAnimationFrame <= 80) {
      switch (Math.floor(this.deathAnimationFrame / 2) % 4) {
        case 0:
          this.facing = 'down'; break
        case 1:
          this.facing = 'right'; break
        case 2:
          this.facing = 'up'; break
        case 3:
          this.facing = 'left'; break
      }
      this.sprite.setSprite(['basic', this.facing, 0])
    }
    if (this.deathAnimationFrame === 80) {
      this.getNode().blendMode = "LUMINOSITY"
    }

    this.deathAnimationFrame++
    return this.deathAnimationFrame < 120
  }

  public winAnimationFrame = 0
  public winAnimation() {
    const spriteName = (this.winAnimationFrame % 8 < 4) ? 'win-0' : 'win-1'
    this.sprite.setSprite([spriteName])
    this.winAnimationFrame++
    return this.winAnimationFrame < 200
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
    if (this.swordActiveFrame === null && this.bowActiveFrame === null) {
      this.facing = changeFacing(this.facing)
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
    this.bowAnimation()

    const leniency = 1
    return {
      x: this.getNode().x + leniency,
      y: this.getNode().y + leniency,
      width: 16 - leniency,
      height: 16 - leniency,
    }

  }

  private bowAnimation() {
    if (this.bowActiveFrame === null) {
      return
    }

    if (this.bowActiveFrame === 3) {
      addProjectile((new Arrow(this.collision, this.getNode(), this.facing)).initialMove())
    }

    if (this.bowActiveFrame > 6) {
      this.bowActiveFrame = null
    } else {
      this.bowActiveFrame++
    }
  }

  protected onDeath() {} // do not remove link node on death

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
