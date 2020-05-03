import { OctorokRed, OctorokBlue } from "./octorok"
import { MoblinBlue, MoblinRed } from "./moblin"
import { Actor } from "../actor"
import { LynelRed } from "./lynel_red"
import { detachNode } from "../../lib"
import { Scarecrow } from "./scarecrow"

export function loadEnemies(worldNode: FrameNode) {
  const enemies: Actor[] = []
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
    if (!node.removed) {
      switch (node.name) {
        case 'octorok-red':
          enemies.push(new OctorokRed(detachNode(node)))
          break
        case 'octorok-blue':
          enemies.push(new OctorokBlue(detachNode(node)))
          break
        case 'moblin-red':
          enemies.push(new MoblinRed(detachNode(node)))
          break
        case 'moblin-blue':
          enemies.push(new MoblinBlue(detachNode(node)))
          break
        case 'lynel-red':
          enemies.push(new LynelRed(detachNode(node)))
          break
        case 'scarecrow':
          enemies.push(new Scarecrow(detachNode(node)))
          break
      }
    }
  })
  return enemies
}
