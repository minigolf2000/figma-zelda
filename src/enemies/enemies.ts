import { Collision } from "../collision"
import { OctorokRed } from "./octorok_red"
import { MoblinBlue } from "./moblin_blue"
import { Actor } from "../actor"

export function loadEnemies(worldNode: FrameNode, collision: Collision, linkNode: InstanceNode) {
  const enemies: Actor[] = []
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
    switch (node.name) {
      case 'octorok-red':
        enemies.push(new OctorokRed(node, collision))
        break
      case 'moblin-blue':
        enemies.push(new MoblinBlue(node, collision))
        break
    }
  })
  return enemies
}

