import { Sprite } from "../../sprite"
import { Facing } from "../../lib"
import { Tiles } from "../../tiles"
import { Actor } from "../actor"
import { multiply } from "../../vector"
import { Arrow } from "../arrow"

const MAX_WALK_FRAMES = 28
const RED_HEALTH = 1.0
const BLUE_HEALTH = 1.5
const WALK_SPEED = 1
const DAMAGE = 0.5
class Moblin extends Actor {
  private sprite: Sprite
  private walkingFrame: number = 0

  public constructor(node: InstanceNode, collision: Tiles, health: number, addProjectile: (projectile: Actor) => void) {
    super(node, collision, health, 'down', addProjectile)
    this.sprite = new Sprite(node, ['basic', 'down', 0])
    this.walkingFrame = Math.floor(Math.random() * MAX_WALK_FRAMES)
    this.damage = DAMAGE
  }

  public nextFrame() {
    if (this.health <= 0) {
      this.getNode().visible = false
      return null
    }
    this.incrementInvulnerability()
    if (this.walkingFrame === 0) {
      const choices: Facing[] = ['up', 'down', 'left', 'right']
      this.facing = choices[Math.floor(Math.random() * choices.length)]
    }

    this.walkingFrame++
    if (this.walkingFrame === MAX_WALK_FRAMES) this.walkingFrame = 0
    this.sprite.setSprite(['basic', this.facing, Math.floor(this.walkingFrame / 4) % 2])

    if (this.walkingFrame < 8) {
      this.move(multiply(this.facingVector(), WALK_SPEED))
    }
    if (this.walkingFrame === MAX_WALK_FRAMES - 1) {
      this.addProjectile(new Arrow(this.collision, this.getProjectileStartPosition(), this.facing))
    }

    return this.getCurrentCollision()
  }
}

export class MoblinRed extends Moblin {
  public constructor(node: InstanceNode, collision: Tiles, addProjectile: (projectile: Actor) => void) {
    super(node, collision, RED_HEALTH, addProjectile)
  }
}
export class MoblinBlue extends Moblin {
  public constructor(node: InstanceNode, collision: Tiles, addProjectile: (projectile: Actor) => void) {
    super(node, collision, BLUE_HEALTH, addProjectile)
  }
}