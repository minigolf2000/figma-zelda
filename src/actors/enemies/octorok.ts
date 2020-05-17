import { Sprite } from "../../sprite"
import { Facing, getLink, addProjectile } from "../../lib"
import { Rectangle } from "../../tiles"
import { Actor } from "../actor"
import { multiply, vectorToFacing, facingToVector } from "../../vector"
import { OctorokRock } from "../projectile"

const RED_HEALTH = 0.5
const BLUE_HEALTH = 1.0
const WALK_SPEED = 1.0
const DAMAGE = 0.5

const SIGHT_DISTANCE = 15 * 16 // 15 tiles

class Octorok extends Actor {
  private sprite: Sprite
  private spriteAnimationFrame: number
  private walkingFrame: number = 0
  private shootingFrame: number | null = null

  public constructor(node: FrameNode, health: number) {
    super(node, health, 'down')
    this.sprite = new Sprite(node, ['basic', 'down', 0])
    this.spriteAnimationFrame = Math.floor(Math.random() * 4)
    this.walkingFrame = Math.floor(Math.random() * 48)
    this.damage = DAMAGE
  }

  public nextFrame() {
    if (this.health <= 0) {
      this.getNode().remove()
      return false
    }

    this.incrementInvulnerability()
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.spriteAnimationFrame / 4) % 2])

    if (this.shootingFrame !== null) {
      this.shootBehavior()
    } else {
      this.wanderBehavior()
    }

    this.spriteAnimationFrame++
    return true
  }

  private shootBehavior() {
    if (this.shootingFrame === 12) {
      addProjectile(new OctorokRock(this))
    }

    this.shootingFrame!++

    if (this.shootingFrame === 16) {
      this.shootingFrame = null
    }
  }

  private wanderBehavior() {
    if (this.walkingFrame === 0) {
      if (Math.random() < 0.8) {
        this.facing = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Facing
      } else {
        // Every once in a while, walk toward home
        this.facing = vectorToFacing({x: this.homeVector.x - this.node.x, y: this.homeVector.y - this.node.y})
      }
    }

    if (!this.move(multiply(facingToVector(this.facing), WALK_SPEED))) {
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
    const linkNode: Rectangle = getLink().getCurrentCollision()
    const octorokNode: Rectangle = this.getCurrentCollision()

    // Assign variables assuming Octorok is facing right. Then reassign if the facing is different
    let linkX = linkNode.x
    let linkWidth = linkNode.width
    let linkY = linkNode.y
    let linkHeight = linkNode.height
    let octorokX = octorokNode.x
    let octorokWidth = octorokNode.width
    let octorokY = octorokNode.y
    let octorokHeight = octorokNode.height
    switch (this.facing) {
      case 'right':
        break
      case 'left':
        linkX = -linkNode.x
        octorokX = -octorokNode.x
        break
      case 'down':
        linkX = linkNode.y
        linkWidth = linkNode.height
        linkY = linkNode.x
        linkHeight = linkNode.width
        octorokX = octorokNode.y
        octorokWidth = octorokNode.height
        octorokY = octorokNode.x
        octorokHeight = octorokNode.width
        break
      case 'up':
        linkX = -linkNode.y
        linkWidth = linkNode.height
        linkY = linkNode.x
        linkHeight = linkNode.width
        octorokX = -octorokNode.y
        octorokWidth = octorokNode.height
        octorokY = octorokNode.x
        octorokHeight = octorokNode.width
        break
    }

    return linkX + linkWidth / 2 > octorokX + octorokWidth / 2 &&
      linkX - octorokX <= SIGHT_DISTANCE &&
      linkY + linkHeight > octorokY &&
      linkY < octorokY + octorokHeight
  }
}

export class OctorokRed extends Octorok {
  public constructor(node: FrameNode) {
    super(node, RED_HEALTH)
  }
}

export class OctorokBlue extends Octorok {
  public constructor(node: FrameNode) {
    super(node, BLUE_HEALTH)
  }
}