import { detachNode, createNewLibSprite } from "../lib"
import { Link } from "../link"
import { Rectangle, isOverlapping } from "../tiles"
import { Sprite } from "../sprite"

let items: Items
export function setItems(l: Items) {
  items = l
}

export function getItems() {
  return items
}

export class Items {
  private items: Item[] = []

  public constructor(worldNode: FrameNode) {
    // TODO: flatten groups and move items to bottom
    worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
      if (!node.removed) {
        switch (node.name) {
          case 'triforce':
            this.items.push(new Triforce(detachNode(node)))
            break
          case 'master-sword':
            this.items.push(new MasterSword(detachNode(node)))
            break
          case 'bow':
            this.items.push(new Bow(detachNode(node)))
            break
        }
      }
    })
  }

  public triforceShardTotal() {
    return this.items.filter(i => i.getNode().name === 'triforce').length
  }

  public spawnHeart(dropLocation: Rectangle) {
    this.items.push(new Heart(dropLocation))
  }

  public getIfOverlapping(link: Link, linkNode: Rectangle) {
    this.items = this.items.filter(i => {
      // Maybe optimize this for performance by storing a hash of positions
      if (isOverlapping(i.getNode(), linkNode)) {
        i.get(link)
        i.getNode().remove()
        return false
      }
      return true
    })
  }

  public nextFrame() {
    this.items = this.items.filter(i => i.nextFrame())
  }
}

abstract class Item {
  protected node: FrameNode
  abstract get(link: Link): void
  abstract nextFrame(): boolean

  public constructor(node: FrameNode) {
    this.node = node
  }

  public getNode() {
    return this.node
  }

}

class Bow extends Item {
  public get(link: Link) {
    figma.ui.postMessage({setBow: "bow"})
    link.getBow()
  }

  public nextFrame() {
    return true
  }
}

const HEART_WIDTH = 7
const HEART_HEIGHT = 7
const HEART_LIFESPAN = 8 * 30 // 8 seconds
class Heart extends Item {
  private sprite: Sprite
  private animationFrame: number = 0

  public constructor(dropLocation: Rectangle) {
    super(createNewLibSprite('heart'))
    this.node.x = dropLocation.x + dropLocation.width / 2 - HEART_WIDTH / 2
    this.node.y = dropLocation.y + dropLocation.height / 2 - HEART_HEIGHT / 2
    this.sprite = new Sprite(this.node, ['red'])
  }

  public get(link: Link) {
    link.getHeart()
  }

  public nextFrame() {
    if (this.animationFrame % 30 === 25) {
      this.sprite.setSprite(['red'])
    } else if (this.animationFrame % 30 === 10) {
      this.sprite.setSprite(['black'])
    }

    if (this.animationFrame === HEART_LIFESPAN) {
      this.node.remove()
      return false
    } else {
      this.animationFrame++
      return true
    }
  }
}

class MasterSword extends Item {
  private animationFrame: number = 0
  private sprite: Sprite
  public node: FrameNode

  public constructor(node: FrameNode) {
    super(node)
    this.sprite = new Sprite(node, ['basic', 'down', 0])
  }

  public get(link: Link) {
    figma.ui.postMessage({setSword: "master-sword"})
    link.getMasterSword()
  }

  public nextFrame() {
    if (this.animationFrame === 55) {
      this.sprite.setSprite(['basic', 'down', 1])
    }
    if (this.animationFrame === 58) {
      this.sprite.setSprite(['basic', 'down', 2])
    }
    if (this.animationFrame === 64) {
      this.animationFrame = 0
      this.sprite.setSprite(['basic', 'down', 0])
    } else {
      this.animationFrame++
    }
    return true
  }
}


class Triforce extends Item {
  private animationFrame: number = 0
  private sprite: Sprite
  public node: FrameNode

  public constructor(node: FrameNode) {
    super(node)
    this.sprite = new Sprite(node, ['yellow'])
  }

  public get(link: Link) {
    link.getTriforceShard()
  }

  public nextFrame() {
    if (this.animationFrame === 15) {
      this.sprite.setSprite(['blue'])
    }
    if (this.animationFrame === 30) {
      this.sprite.setSprite(['yellow'])
      this.animationFrame = 0
    }
    this.animationFrame++
    return true
  }
}
