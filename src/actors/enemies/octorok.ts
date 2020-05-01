import { Sprite } from "../../sprite"
import { Facing, createNewLibSprite, getLink } from "../../lib"
import { Tiles, Rectangle } from "../../tiles"
import { Actor } from "../actor"
import { multiply } from "../../vector"

const RED_HEALTH = 0.5
const BLUE_HEALTH = 1.0
const WALK_SPEED = 1.0
const ROCK_SPEED = 4.0
const DAMAGE = 0.5

class Rock extends Actor {
  private frames: number = 0
  public constructor(collision: Tiles, shooterRectangle: Rectangle, facing: Facing) {
    super(createNewLibSprite('octorok-rock'), collision, Infinity, facing)
    this.node.x = shooterRectangle.x + shooterRectangle.width / 2 - this.node.width / 2
    this.node.y = shooterRectangle.y + shooterRectangle.height / 2 - this.node.height / 2
    this.damage = DAMAGE
  }

  public initialMove() {
    if (this.move(multiply(this.facingVector(), 16))) {
      return this
    }
    this.getNode().remove()
    return null
  }

  public nextFrame() {
    this.frames++
    const successfulMove = this.move(multiply(this.facingVector(), ROCK_SPEED))
    if (this.frames <= 100 && successfulMove) {
      return this.getCurrentCollision()
    } else {
      this.getNode().remove()
      return null
    }
  }
}

class Octorok extends Actor {
  private sprite: Sprite
  private spriteAnimationFrame: number
  private walkingFrame: number = 0
  private shootingFrame: number | null = null

  public constructor(node: InstanceNode, collision: Tiles, health: number, addProjectile: (projectile: Actor) => void) {
    super(node, collision, health, 'down', addProjectile)
    this.sprite = new Sprite(node, ['basic', 'down', 0])
    this.spriteAnimationFrame = Math.floor(Math.random() * 4)
    this.walkingFrame = Math.floor(Math.random() * 48)
    this.addProjectile = addProjectile
    this.damage = DAMAGE
  }

  private turnRandomly() {
    this.facing = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Facing
  }

  private forceTurn() {
    if (this.facing === 'up') {
      this.facing = ['down', 'left', 'right'][Math.floor(Math.random() * 3)] as Facing
    } else if (this.facing === 'down') {
      this.facing = ['up', 'left', 'right'][Math.floor(Math.random() * 3)] as Facing
    } else if (this.facing === 'left') {
      this.facing = ['up', 'down', 'right'][Math.floor(Math.random() * 3)] as Facing
    } else if (this.facing === 'right') {
      this.facing = ['up', 'down', 'left'][Math.floor(Math.random() * 3)] as Facing
    }
  }

  public nextFrame() {
    if (this.health <= 0) {
      this.getNode().visible = false
      return null
    }

    this.incrementInvulnerability()
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.spriteAnimationFrame / 4) % 2])

    if (this.shootingFrame !== null) {
      this.shootBehavior()
    } else {
      this.wanderingBehavior()
    }

    this.spriteAnimationFrame++
    return this.getCurrentCollision()
  }

  private shootBehavior() {
    if (this.shootingFrame === 8) {
      this.addProjectile((new Rock(this.collision, this.getNode(), this.facing)).initialMove())
    }

    this.shootingFrame!++

    if (this.shootingFrame === 16) {
      this.shootingFrame = null
    }
  }

  private wanderingBehavior() {
    if (this.walkingFrame === 0) {
      this.turnRandomly()
    }

    if (!this.move(multiply(this.facingVector(), WALK_SPEED))) {
      this.forceTurn()
    }

    // Any time after 16, Octorok can lock on and enter shooting mode
    if (this.walkingFrame > 16 && this.shouldShoot()) {
      this.shootingFrame = 0
      this.walkingFrame = 0
    } else if (this.walkingFrame === 32) {
      this.walkingFrame = 0
    } else {
      this.walkingFrame++
    }
  }

  // Octorok will only shoot when facing toward Link
  private shouldShoot() {
    const linkNode: Rectangle = getLink().getNode()

    // Assign variables assuming Octorok is facing right. Then reassign if the facing is different
    let linkX = linkNode.x
    let linkWidth = linkNode.width
    let linkY = linkNode.y
    let linkHeight = linkNode.height
    let octorokX = this.node.x
    let octorokWidth = this.node.width
    let octorokY = this.node.y
    let octorokHeight = this.node.height
    switch (this.facing) {
      case 'right':
        break
      case 'left':
        linkX = -linkNode.x
        octorokX = -this.node.x
        break
      case 'down':
        linkX = linkNode.y
        linkWidth = linkNode.height
        linkY = linkNode.x
        linkHeight = linkNode.width
        octorokX = this.node.y
        octorokWidth = this.node.height
        octorokY = this.node.x
        octorokHeight = this.node.width
        break
      case 'up':
        linkX = -linkNode.y
        linkWidth = linkNode.height
        linkY = linkNode.x
        linkHeight = linkNode.width
        octorokX = -this.node.y
        octorokWidth = this.node.height
        octorokY = this.node.x
        octorokHeight = this.node.width
        break
    }

    return linkX + linkWidth / 2 > octorokX + octorokWidth / 2 &&
      linkY + linkHeight > octorokY && linkY < octorokY + octorokHeight
  }
}

export class OctorokRed extends Octorok {
  public constructor(node: InstanceNode, collision: Tiles, addProjectile: (projectile: Actor) => void) {
    super(node, collision, RED_HEALTH, addProjectile)
  }
}

export class OctorokBlue extends Octorok {
  public constructor(node: InstanceNode, collision: Tiles, addProjectile: (projectile: Actor) => void) {
    super(node, collision, BLUE_HEALTH, addProjectile)
  }
}