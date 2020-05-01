import { Sprite } from "../../sprite"
import { Facing, getLink, addProjectile } from "../../lib"
import { Tiles, Rectangle } from "../../tiles"
import { Actor } from "../actor"
import { multiply } from "../../vector"
import { OctorokRock } from "../projectile"

const RED_HEALTH = 0.5
const BLUE_HEALTH = 1.0
const WALK_SPEED = 1.0
const DAMAGE = 0.5

class Octorok extends Actor {
  private sprite: Sprite
  private spriteAnimationFrame: number
  private walkingFrame: number = 0
  private shootingFrame: number | null = null

  public constructor(node: FrameNode, collision: Tiles, health: number) {
    super(node, collision, health, 'down')
    this.sprite = new Sprite(node, ['basic', 'down', 0])
    this.spriteAnimationFrame = Math.floor(Math.random() * 4)
    this.walkingFrame = Math.floor(Math.random() * 48)
    this.damage = DAMAGE
  }

  public nextFrame() {
    if (this.health <= 0) {
      this.getNode().remove()
      return null
    }

    this.incrementInvulnerability()
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.spriteAnimationFrame / 4) % 2])

    if (this.shootingFrame !== null) {
      this.shootBehavior()
    } else {
      this.wanderBehavior()
    }

    this.spriteAnimationFrame++
    return this.getCurrentCollision()
  }

  private shootBehavior() {
    if (this.shootingFrame === 8) {
      addProjectile((new OctorokRock(this.collision, this.getNode(), this.facing)).initialMove())
    }

    this.shootingFrame!++

    if (this.shootingFrame === 16) {
      this.shootingFrame = null
    }
  }

  private wanderBehavior() {
    if (this.walkingFrame === 0) {
      // Turn randomly
      this.facing = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Facing
    }

    if (!this.move(multiply(this.facingVector(), WALK_SPEED))) {
      // Force turn to another direction
      this.facing = ['up', 'down', 'left', 'right'].filter(f => f !== this.facing)[Math.floor(Math.random() * 3)] as Facing
    }

    // Any time after 16, Octorok can lock on and enter shooting mode
    if (this.walkingFrame > 16 && this.seesLinkInLineOfSight()) {
      this.shootingFrame = 0
      this.walkingFrame = 0
    } else if (this.walkingFrame === 32) {
      this.walkingFrame = 0
    } else {
      this.walkingFrame++
    }
  }

  private seesLinkInLineOfSight() {
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
  public constructor(node: FrameNode, collision: Tiles) {
    super(node, collision, RED_HEALTH)
  }
}

export class OctorokBlue extends Octorok {
  public constructor(node: FrameNode, collision: Tiles) {
    super(node, collision, BLUE_HEALTH)
  }
}