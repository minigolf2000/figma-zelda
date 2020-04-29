import { MasterSword } from "./master-sword"
import { Triforce } from "./triforce"

export function loadItems(worldNode: FrameNode): (Triforce | MasterSword)[] {
  const items: (Triforce | MasterSword)[] = []
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
    switch (node.name) {
      case 'triforce':
        items.push(new Triforce(node))
        break
      case 'master-sword':
        items.push(new MasterSword(node))
        break
    }
  })
  return items
}

