import { Sprite } from "../sprite"

export class MasterSword {
  private animationFrame: number = 0
  private sprite: Sprite
  public node: InstanceNode

  public constructor(node: InstanceNode) {
    this.node = node
    this.sprite = new Sprite(node, ['basic', 'down', 0])
  }

  public nextFrame() {
    if (this.animationFrame === 42) {
      this.sprite.setSprite(['basic', 'down', 1])
    }
    if (this.animationFrame === 44) {
      this.sprite.setSprite(['basic', 'down', 2])
    }
    if (this.animationFrame === 48) {
      this.animationFrame = 0
      this.sprite.setSprite(['basic', 'down', 0])
    }
    this.animationFrame++
    return null
  }
}
