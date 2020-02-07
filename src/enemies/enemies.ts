import { OctorokRed } from "./octorok_red"
import { Collision } from "../collision"

export function loadEnemies(worldNode: FrameNode, collision: Collision, linkNode: InstanceNode) {
  const enemies: OctorokRed[] = []
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
    switch (node.name) {
      case 'octorok_red':
        enemies.push(new OctorokRed(node, collision))
        break
      // case 37: // LEFT_ARROW
      // case 65: // A
    }
  })
  return enemies
}

