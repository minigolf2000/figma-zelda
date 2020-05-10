import { Actor } from './actors/actor'
import { getItems } from './actors/items'
import { paused } from './buttons'
import { init } from './init'
import { CAMERA_BOX_SIZE, FPS, getLink, getProjectiles, setProjectiles, updateCamera } from './lib'
import { isOverlapping } from './tiles'
import { getEnemies } from './actors/enemies/enemies'
import { getMultiplayerLinks } from './actors/multiplayer_links'

let gameLost = false

// The main game loop function that gets called `FPS` times per second
// Performs some logic, then delegates logic to each actor's nextFrame()
function nextFrame() {
  const link = getLink()
  const linkNode = link.getCurrentCollision()
  const items = getItems()
  const enemies = getEnemies()
  const multiplayerLinks = getMultiplayerLinks()

  if (paused) {
    return
  }
  if (link.buttonsPressed.esc) {
    figma.closePlugin()
    return
  }

  if (link.winAnimationFrame !== null) {
    enemies.removeAll()
    if (!link.winAnimation()) { figma.closePlugin() }
    return
  }
  if (gameLost) {
    enemies.removeAll()
    if (!link.deathAnimation()) { figma.closePlugin() }
    return
  }
  items.getIfOverlapping(link, linkNode)
  items.nextFrame()

  link.nextFrame()
  multiplayerLinks.nextFrame()
  const linkHurtbox = link.getCurrentCollision()
  const linkHitbox = link.hitBox()

  // move projectiles
  setProjectiles(getProjectiles().filter(projectile => !!projectile.nextFrame()))

  enemies.nextFrame()

  enemies.setAll(enemies.getAll().filter((enemy: Actor) => {
    const enemyHitbox = enemy.getCurrentCollision()

    // enemy damages link
    const hurtVector = isOverlapping(linkHurtbox, enemyHitbox)
    if (hurtVector) {
      const health = link.takeDamage(enemy.getDamage(), hurtVector)
      if (health <= 0) { gameLost = true }
    }

    // link damages enemy
    if (linkHitbox) {
      const hitVector = isOverlapping(enemyHitbox, linkHitbox)
      if (hitVector) {
        const enemyHealth = enemy.takeDamage(link.getDamage(), link.facingVector())
        if (enemyHealth <= 0) {
          return false
        }
      }
    }

    let enemyKilledByProjectile = false
    setProjectiles(getProjectiles().filter((projectile: Actor) => {
      // projectiles damage enemy
      const hitVector = isOverlapping(enemyHitbox, projectile.getCurrentCollision())
      if (hitVector) {
        const enemyHealth = enemy.takeDamage(projectile.getDamage(), projectile.facingVector())
        if (enemyHealth <= 0) {
          enemyKilledByProjectile = true
        }
        projectile.getNode().remove()
        return false
      }
      return true
    }))
    return !enemyKilledByProjectile
  }))

  setProjectiles(getProjectiles().filter((projectile: Actor) => {
    // projectiles damage link
    const hurtVector = isOverlapping(linkHurtbox, projectile.getCurrentCollision())
    if (hurtVector) {
      if (!link.isShielding(projectile)) {
        const health = link.takeDamage(projectile.getDamage(), hurtVector)
        if (health <= 0) { gameLost = true }
      }
      projectile.getNode().remove()
      return false
    }
    return true
  }))

  updateCamera(linkNode, CAMERA_BOX_SIZE)
  // printFPS()
}

let lastFrameTimestamp: number = Date.now()
export function printFPS() {
  const currentFrameTimestamp = Date.now()
  const fps = Math.round(1000 / (currentFrameTimestamp - lastFrameTimestamp))
  lastFrameTimestamp = currentFrameTimestamp
  console.info(`fps: ${fps}`)
}

if (init()) {
  setInterval(nextFrame, 1000 / FPS)
}