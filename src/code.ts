import { Actor } from './actors/actor'
import { getItems } from './actors/items'
import { paused } from './buttons'
import { init, initReturnValue } from './init'
import { CAMERA_BOX_SIZE, FPS, getLink, getProjectiles, setProjectiles, updateCamera, displayHealth } from './lib'
import { isOverlapping } from './tiles'
import { getEnemies } from './actors/enemies/enemies'
import { getMultiplayerLinks } from './actors/multiplayer_links'

let gameLost = false

// The main game loop function that gets called `FPS` times per second
// Performs some logic, then delegates logic to each actor's nextFrame()
function nextFrame() {
  const link = getLink()
  const items = getItems()
  const enemies = getEnemies()
  const allLinks = [link, ...getMultiplayerLinks().getAll()]

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

  items.getIfOverlapping(allLinks)
  items.nextFrame()
  link.nextFrame()
  getMultiplayerLinks().nextFrame()
  setProjectiles(getProjectiles().filter(projectile => !!projectile.nextFrame()))
  enemies.nextFrame()

  calculateDamages()

  updateCamera(link.getCurrentCollision(), CAMERA_BOX_SIZE)
  // printFPS()
}

// Game loop run by multiplayerLinks
function nextFrameClient() {
  const link = getLink()
  const linkNode = link.getNode()
  if (linkNode.removed) {
    // Server has closed and game is over
    // TODO: figure out how to make this avoid emitting "node with id does not exist" console error
    figma.closePlugin()
    return
  }

  // handle pause
  // handle win/lose
  // handle item get

  // Update link's plugin data
  linkNode.setPluginData("buttons-pressed", JSON.stringify(link.buttonsPressed))
  updateCamera(link.getCurrentCollision(), CAMERA_BOX_SIZE)
  // printFPS()
}

function calculateDamages() {
  const link = getLink()
  const enemies = getEnemies()
  const allLinks = [link, ...getMultiplayerLinks().getAll()]

  enemies.setAll(enemies.getAll().filter((enemy: Actor) => {
    const enemyHitbox = enemy.getCurrentCollision()

    for (let l of allLinks) {
      // enemy damages link
      const hurtVector = isOverlapping(l.getCurrentCollision(), enemyHitbox)
      if (hurtVector) {
        const health = l.takeDamage(enemy.getDamage(), hurtVector)
        if (l === link) {
          figma.ui.postMessage({health: displayHealth(health, 3)})
        }
        if (health <= 0) { gameLost = true }
      }

      const linkHitbox = l.swordCollision()
      // link damages enemy
      if (linkHitbox) {
        const hitVector = isOverlapping(enemyHitbox, linkHitbox)
        if (hitVector) {
          const enemyHealth = enemy.takeDamage(l.getDamage(), l.facingVector())
          if (enemyHealth <= 0) {
            return false
          }
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
    for (let l of allLinks) {
      const hurtVector = isOverlapping(l.getCurrentCollision(), projectile.getCurrentCollision())
      if (hurtVector) {
        if (!l.isShielding(projectile)) {
          const health = l.takeDamage(projectile.getDamage(), hurtVector)
          if (l === link) {
            figma.ui.postMessage({health: displayHealth(health, 3)})
          }
          if (health <= 0) { gameLost = true }
        }
        projectile.getNode().remove()
        return false
      }
    }
    return true
  }))
}

let lastFrameTimestamp: number = Date.now()
export function printFPS() {
  const currentFrameTimestamp = Date.now()
  const fps = Math.round(1000 / (currentFrameTimestamp - lastFrameTimestamp))
  lastFrameTimestamp = currentFrameTimestamp
  console.info(`fps: ${fps}`)
}

const i = init()
if (i === initReturnValue.server) {
  setInterval(nextFrame, 1000 / FPS)
} else if (i === initReturnValue.client) {
  setInterval(nextFrameClient, 1000 / FPS)
}