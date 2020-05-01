import { MasterSword } from "./master-sword"
import { Triforce } from "./triforce"
import { detachNode } from "../lib"

export function loadItems(worldNode: FrameNode): (Triforce | MasterSword)[] {
  const items: (Triforce | MasterSword)[] = []
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
    if (!node.removed) {
      switch (node.name) {
        case 'triforce':
          items.push(new Triforce(detachNode(node)))
          break
        case 'master-sword':
          items.push(new MasterSword(detachNode(node)))
          break
      }
    }
  })
  return items
}
