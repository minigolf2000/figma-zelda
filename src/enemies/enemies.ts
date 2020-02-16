import { Tiles } from "../tiles"
import { OctorokRed } from "./octorok_red"
import { MoblinBlue } from "./moblin_blue"
import { Actor } from "../actor"
import { LynelRed } from "./lynel_red"

export function loadEnemies(worldNode: FrameNode, collision: Tiles, linkNode: InstanceNode, addProjectile: (projectile: Actor) => void) {
  const enemies: Actor[] = []
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
    switch (node.name) {
      case 'octorok-red':
        enemies.push(new OctorokRed(node, collision, addProjectile))
        break
      case 'octorok-blue':
        enemies.push(new OctorokRed(node, collision, addProjectile))
        break
      case 'moblin-red':
        enemies.push(new MoblinBlue(node, collision))
        break
      case 'moblin-blue':
        enemies.push(new MoblinBlue(node, collision))
        break
      case 'lynel-red':
        enemies.push(new LynelRed(node, collision))
        break
    }
  })
  return enemies
}

