import { Actor } from './actors/actor'
import { getItems } from './actors/items'
import { paused } from './buttons'
import { init, initReturnValue } from './init'
import { CAMERA_BOX_SIZE, FPS, getLink, getProjectiles, setProjectiles, updateCamera, ClientMessages } from './lib'
import { isOverlapping } from './tiles'
import { getEnemies } from './actors/enemies/enemies'
import { getMultiplayerLinks } from './actors/multiplayer_links'
import { facingToVector } from './vector'

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
    for (let l of allLinks) {
      if (!l.winAnimation()) {
        figma.closePlugin()
        break
      }
    }

    return
  }

  items.getIfOverlapping(allLinks)
  items.nextFrame()
  if (!link.nextFrame()) {
    // Link is dead
    figma.closePlugin()
  }
  getMultiplayerLinks().nextFrame()
  setProjectiles(getProjectiles().filter(projectile => !!projectile.nextFrame()))
  enemies.nextFrame()

  calculateDamages()
  updateUIWithNewItems(link.getNode())

  updateCamera(link.getCurrentCollision(), CAMERA_BOX_SIZE)
  // printFPS()
}

// Game loop run by multiplayerLinks
function nextFrameClient() {
  const link = getLink() // does client really even need a Link object?
  const linkNode = link.getNode()
  if (linkNode.removed) {
    // Server has closed and game is over
    // TODO: figure out how to make this avoid emitting "node with id does not exist" console error
    figma.closePlugin()
    return
  }

  // handle pause
  // handle win/lose
  updateUIWithNewItems(linkNode)

  // Update link's plugin data
  linkNode.setPluginData("buttons-pressed", JSON.stringify(link.buttonsPressed))

  // actually pass in linkNode here since link's position never gets updated
  // in the client. this feels weird
  updateCamera(linkNode, CAMERA_BOX_SIZE)
  // printFPS()
}

function updateUIWithNewItems(linkNode: FrameNode) {
  const rawMessages = linkNode.getPluginData("messages")
  if (rawMessages === "") {
    return
  }

  // technically is possible for a new message to come in during this time
  // probably have to introduce some locking mechanism to prevent race conditions
  linkNode.setPluginData("messages", "")
  const messages = JSON.parse(rawMessages) as ClientMessages
  if (messages.getBow) {
    figma.ui.postMessage({setBow: "bow"})
  }
  if (messages.health) {
    figma.ui.postMessage({health: messages.health})
  }
  if (messages.getSword) {
    figma.ui.postMessage({setSword: "master-sword"})
  }
  if (messages.triforceShards) {
    figma.ui.postMessage({triforceShards: messages.triforceShards})
  }
  if (messages.win) {
    getLink().winAnimationFrame = 0
  }
  if (messages.death && !getMultiplayerLinks()) {
    // If Link is dead and this is a client, close plugin
    figma.closePlugin()
  }
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
        l.takeDamage(enemy.getDamage(), hurtVector)
      }

      const linkHitbox = l.swordCollision()
      // link damages enemy
      if (linkHitbox) {
        const hitVector = isOverlapping(enemyHitbox, linkHitbox)
        if (hitVector) {
          const knockbackFacing = l.knockbackFacing()
          const enemyHealth = enemy.takeDamage(l.getDamage(), knockbackFacing && facingToVector(knockbackFacing))
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
        const knockbackFacing = projectile.knockbackFacing()
        const enemyHealth = enemy.takeDamage(projectile.getDamage(), knockbackFacing && facingToVector(knockbackFacing))
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
          l.takeDamage(projectile.getDamage(), hurtVector)
        }
        projectile.getNode().remove()
        return false
      }
    }
    return true
  }))

  // Sword friendly fire
  for (let l1 of allLinks) {
    const swordHitbox = l1.swordCollision()
    if (swordHitbox) {
      for (let l2 of allLinks) {
        if (l1 !== l2) {
          const hurtVector = isOverlapping(l2.getCurrentCollision(), swordHitbox)
          if (hurtVector) {
            l2.takeDamage(l1.getDamage(), hurtVector)
          }
        }
      }
    }
  }
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
  figma.notify("Successfully joined")
  setInterval(nextFrameClient, 1000 / FPS)
}