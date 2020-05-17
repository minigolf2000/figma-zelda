import { createNewLibSprite, displayHealth, ClientMessages, incrementTriforceShardsCurrent, getLink } from "../lib"
import { Link } from "../link"
import { Rectangle, isOverlapping } from "../tiles"
import { Sprite } from "../sprite"

let items: Items
export function getItems() {
  return items
}

export class Items {
  private items: Item[] = []

  public constructor(nodes: FrameNode[]) {
    // TODO: flatten groups and move items to bottom
    nodes.forEach((node: FrameNode) => {
      switch (node.name) {
        case 'triforce':
          this.items.push(new Triforce(node))
          break
        case 'master-sword':
          this.items.push(new MasterSword(node))
          break
        case 'bow':
          this.items.push(new Bow(node))
          break
      }
    })

    items = this
  }

  public triforceShardTotal() {
    return this.items.filter(i => i.getNode().name === 'triforce').length
  }

  public spawnHeart(dropLocation: Rectangle) {
    this.items.push(new Heart(dropLocation))
  }

  public getIfOverlapping(allLinks: Link[]) {
    this.items = this.items.filter(i => {
      for (const l of allLinks) {
        // TODO: Maybe optimize this for performance by storing a hash of item positions
        if (isOverlapping(i.getCurrentCollision(), l.getCurrentCollision())) {
          i.get(l)
          i.getNode().remove()
          return false
        }
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
  private currentPosition: Vector
  private width: number
  private height: number

  public constructor(node: FrameNode) {
    this.node = node
    this.currentPosition = {
      x: this.node.x,
      y: this.node.y,
    }

    this.width = this.node.width
    this.height = this.node.height
  }

  public getCurrentCollision(): Rectangle {
    return {...this.currentPosition, width: this.width, height: this.height}
  }

  public setCurrentPosition(position: Vector) {
    this.currentPosition = position

    this.node.x = position.x
    this.node.y = position.y
  }

  public getNode() {
    return this.node
  }
}

class Bow extends Item {
  public get(link: Link) {
    link.getBow()

    const messages = JSON.parse(link.getNode().getPluginData("messages") || "{}") as ClientMessages
    messages.getBow = true
    link.getNode().setPluginData("messages", JSON.stringify(messages))
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
    super(createNewLibSprite(getLink().getNode(), 'heart', 0 /* insert to bottom */))
    this.node.x = dropLocation.x + dropLocation.width / 2 - HEART_WIDTH / 2
    this.node.y = dropLocation.y + dropLocation.height / 2 - HEART_HEIGHT / 2
    this.setCurrentPosition({x: this.node.x, y: this.node.y})
    this.sprite = new Sprite(this.node, ['red'])
  }

  public get(link: Link) {
    link.getHeart()

    const messages = JSON.parse(link.getNode().getPluginData("messages") || "{}") as ClientMessages
    messages.health = displayHealth(link.getHealth(), 3)
    link.getNode().setPluginData("messages", JSON.stringify(messages))
  }

  public nextFrame() {
    if (this.animationFrame % 30 === 26) {
      this.sprite.setSprite(['red'])
    } else if (this.animationFrame % 30 === 11) {
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
    link.getMasterSword()

    const messages = JSON.parse(link.getNode().getPluginData("messages") || "{}") as ClientMessages
    messages.getSword = "master-sword"
    link.getNode().setPluginData("messages", JSON.stringify(messages))
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
    incrementTriforceShardsCurrent()
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
