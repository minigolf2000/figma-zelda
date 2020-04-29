import { Sprite } from "../sprite"

export class Triforce {
  private animationFrame: number = 0
  private sprite: Sprite
  public node: InstanceNode

  public constructor(node: InstanceNode) {
    this.node = node
    this.sprite = new Sprite(node, ['yellow'])
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
    return null
  }
}
