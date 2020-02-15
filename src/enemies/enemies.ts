import { Tiles } from "../tiles"
import { OctorokRed } from "./octorok_red"
import { MoblinBlue } from "./moblin_blue"
import { Actor } from "../actor"

export function loadEnemies(worldNode: FrameNode, collision: Tiles, linkNode: InstanceNode, addProjectile: (projectile: Actor) => void) {
  const enemies: Actor[] = []
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
    switch (node.name) {
      case 'octorok-red':
        enemies.push(new OctorokRed(node, collision, addProjectile))
        break
      case 'moblin-blue':
        enemies.push(new MoblinBlue(node, collision))
        break
    }
  })
  return enemies
}

