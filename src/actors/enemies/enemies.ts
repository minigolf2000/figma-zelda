import { OctorokRed, OctorokBlue } from "./octorok"
import { MoblinBlue, MoblinRed } from "./moblin"
import { Actor } from "../actor"
import { LynelRed } from "./lynel_red"
import { Scarecrow } from "./scarecrow"

export function loadEnemies(nodes: FrameNode[]) {
  const enemies: Actor[] = []
  nodes.forEach((node: FrameNode) => {
    if (!node.removed) {
      switch (node.name) {
        case 'octorok-red':
          enemies.push(new OctorokRed(node))
          break
        case 'octorok-blue':
          enemies.push(new OctorokBlue(node))
          break
        case 'moblin-red':
          enemies.push(new MoblinRed(node))
          break
        case 'moblin-blue':
          enemies.push(new MoblinBlue(node))
          break
        case 'lynel-red':
          enemies.push(new LynelRed(node))
          break
        case 'scarecrow':
          enemies.push(new Scarecrow(node))
          break
      }
    }
  })
  return enemies
}
