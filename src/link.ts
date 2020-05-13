import { Sprite } from "./sprite"
import { Actor } from "./actors/actor"
import { facingOpposite, createNewLibSprite, getWorldNode, addProjectile, Facing, ClientMessages, displayHealth } from "./lib"
import { Buttons } from "./buttons"
import { multiply } from "./vector"
import { Arrow } from "./actors/projectile"
import { Rectangle } from "./tiles"

const HEALTH_MAX = 3.0
const WALK_SPEED = 2.5
const WOODEN_SWORD_DAMAGE = 0.5
const MASTER_SWORD_DAMAGE = 1.0

export class Link extends Actor {
  private walkingFrame: number = 0
  private swordActiveFrame: number | null = null
  private bowActiveFrame: number | null = null
  private swordNode: SceneNode
  private sprite: Sprite
  private swordSprite: Sprite
  private hasBowAndArrow: boolean = false
  private hasMasterSword: boolean = false
  public buttonsPressed: Buttons = {up: false, down: false, left: false, right: false, x: false, z: false, esc: false}

  public constructor(node: FrameNode) {
    super(node, HEALTH_MAX, 'down')
    this.sprite = new Sprite(node, ['basic', 'down', 0])
    this.walkingFrame = 0
    this.swordNode = createNewLibSprite('wooden-sword-held')
    this.swordSprite = new Sprite(this.swordNode)

    this.invulnerabilityKnockbackDuration = 6
    this.invulnerabilityKnockbackMagnitude = 8.0
  }

  public swordCollision(): Rectangle | null {
    return this.swordActiveFrame !== null ?
      {x: this.swordNode.x, y: this.swordNode.y, width: this.swordNode.width, height: this.swordNode.height} :
      null
  }

  public getBow() {
    this.hasBowAndArrow = true
  }

  public getMasterSword() {
    this.swordNode.remove()
    this.swordNode = createNewLibSprite('master-sword-held')
    this.swordSprite = new Sprite(this.swordNode)
    this.hasMasterSword = true
  }

  public getHeart() {
    this.health = Math.min(HEALTH_MAX, this.health + 1)
  }

  public getDamage() {
    return this.hasMasterSword ? MASTER_SWORD_DAMAGE : WOODEN_SWORD_DAMAGE
  }

  public isShielding(projectile: Actor) {
    return this.swordActiveFrame === null && this.bowActiveFrame === null && facingOpposite(this.facing, projectile.facing)
  }

  protected onDeath() {} // do not remove link node on death

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

  public winAnimationFrame: number | null = null
  public winAnimation() {
    const spriteName = (this.winAnimationFrame! % 8 < 4) ? 'win-0' : 'win-1'
    this.sprite.setSprite([spriteName])
    this.winAnimationFrame!++
    return this.winAnimationFrame! < 200
  }

  public getMovementDirection() {
    const vector = {x: 0, y: 0}
    if (this.buttonsPressed.left) vector.x -= 1
    if (this.buttonsPressed.right) vector.x += 1
    if (this.buttonsPressed.up) vector.y -= 1
    if (this.buttonsPressed.down) vector.y += 1
    return vector
  }

  public changeFacing(facing: Facing) {
    if (this.buttonsPressed.down && !this.buttonsPressed.up) return 'down'
    if (this.buttonsPressed.up && !this.buttonsPressed.down) return 'up'
    if (this.buttonsPressed.left && !this.buttonsPressed.right) return 'left'
    if (this.buttonsPressed.right && !this.buttonsPressed.left) return 'right'
    return facing
  }

  public updateButtonsPressedFromPluginData() {
    this.buttonsPressed = JSON.parse(this.getNode().getPluginData("buttons-pressed") || "{}")
  }

  public nextFrame() {
    this.incrementInvulnerability()
    if (this.buttonsPressed.z && this.swordNode && this.swordActiveFrame === null && this.bowActiveFrame === null) {
      this.swordActiveFrame = 0
    }
    if (this.buttonsPressed.x && this.hasBowAndArrow && this.swordActiveFrame === null && this.bowActiveFrame === null) {
      this.bowActiveFrame = 0
    }

    let walking = false
    if (this.swordActiveFrame === null && this.bowActiveFrame === null) {
      this.facing = this.changeFacing(this.facing)
      const direction = this.getMovementDirection()
      walking = direction.x !== 0 || direction.y !== 0
      if (walking) {
        this.move(multiply(direction, WALK_SPEED))
      }
      this.sprite.setSprite(['basic', this.facing, walking && this.walkingFrame < 2 ? 1 : 0])
    }

    // Increment state
    if (walking) {
      if (this.walkingFrame === 3) this.walkingFrame = 0
      else this.walkingFrame++
    }
    this.swordAttack()
    this.bowAttack()

    return true
  }

  public takeDamage(damage: number, direction: Vector) {
    super.takeDamage(damage, direction)

    const messages = JSON.parse(this.getNode().getPluginData("messages") || "{}") as ClientMessages
    messages.health = displayHealth(this.health, 3)
    this.getNode().setPluginData("messages", JSON.stringify(messages))

    return this.health
  }

  private swordAttack() {
    if (this.swordActiveFrame === null) {
      return
    }

    if (this.swordActiveFrame === 0) {
      this.sprite.setSprite(['action', this.facing])
      this.swordSprite.setSprite([this.facing])
    }

    if (this.swordActiveFrame === 1) {
      this.swordNode.visible = true
    }
    const node = this.getCurrentCollision()
    if (this.facing === 'up') {
      switch (this.swordActiveFrame) {
        case 0: case 1: case 2: case 3: // increment on multiple frames incase getting knocked back
          this.swordNode.x = node.x - 1; this.swordNode.y = node.y - 20
          break
        case 4:
          this.swordNode.x = node.x - 1; this.swordNode.y = node.y - 19
          this.sprite.setSprite(['basic', this.facing, 0])
          break
        case 5:
          this.swordNode.x = node.x - 1; this.swordNode.y = node.y - 11
          this.sprite.setSprite(['basic', this.facing, 1])
          break
      }
    }

    if (this.facing === 'right') {
      switch (this.swordActiveFrame) {
        case 0: case 1: case 2: case 3: // increment on multiple frames incase getting knocked back
          this.swordNode.x = node.x + 18; this.swordNode.y = node.y - 1
          break
        case 4:
          this.swordNode.x = node.x + 14; this.swordNode.y = node.y - 1
          this.sprite.setSprite(['basic', this.facing, 1])
          break
        case 5:
          this.swordNode.x = node.x + 10; this.swordNode.y = node.y + 0
          this.sprite.setSprite(['basic', this.facing, 0])
          break
      }
    }

    if (this.facing === 'down') {
      switch (this.swordActiveFrame) {
        case 0: case 1: case 2: case 3: // increment on multiple frames incase getting knocked back
          this.swordNode.x = node.x + 1; this.swordNode.y = node.y + 16
          break
        case 4:
          this.swordNode.x = node.x + 1; this.swordNode.y = node.y + 12
          this.sprite.setSprite(['basic', this.facing, 0])
          break
        case 5:
          this.swordNode.x = node.x + 1; this.swordNode.y = node.y + 8
          this.sprite.setSprite(['basic', this.facing, 1])
          break
      }
    }

    if (this.facing === 'left') {
      switch (this.swordActiveFrame) {
        case 0: case 1: case 2: case 3: // increment on multiple frames incase getting knocked back
          this.swordNode.x = node.x - 17; this.swordNode.y = node.y - 1
          break
        case 4:
          this.swordNode.x = node.x - 13; this.swordNode.y = node.y - 1
          this.sprite.setSprite(['basic', this.facing, 1])
          break
        case 5:
          this.swordNode.x = node.x - 9; this.swordNode.y = node.y + 0
          this.sprite.setSprite(['basic', this.facing, 0])
          break
      }
    }
    if (this.swordActiveFrame === 6) {
      this.swordNode.visible = false
      this.swordActiveFrame = null
    } else {
      this.swordActiveFrame++
    }
  }

  private bowAttack() {
    if (this.bowActiveFrame === null) {
      return
    }

    if (this.bowActiveFrame === 3) {
      addProjectile((new Arrow(this.getCurrentCollision(), this.facing)).initialMove())
    }

    if (this.bowActiveFrame > 6) {
      this.bowActiveFrame = null
    } else {
      this.bowActiveFrame++
    }
  }
}

