import { Tiles } from "../../tiles"
import { OctorokRed, OctorokBlue } from "./octorok"
import { MoblinBlue, MoblinRed } from "./moblin"
import { Actor } from "../actor"
import { LynelRed } from "./lynel_red"

export function loadEnemies(worldNode: FrameNode, collision: Tiles) {
  const enemies: Actor[] = []
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
    switch (node.name) {
      case 'octorok-red':
        enemies.push(new OctorokRed(node, collision))
        break
      case 'octorok-blue':
        enemies.push(new OctorokBlue(node, collision))
        break
      case 'moblin-red':
        enemies.push(new MoblinRed(node, collision))
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