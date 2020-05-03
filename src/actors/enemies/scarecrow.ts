import { Sprite } from "../../sprite"
import { Actor } from "../actor"

const HEALTH = Infinity

// Debugging actor that does nothing and lives forever
export class Scarecrow extends Actor {
  public constructor(node: FrameNode) {
    super(node, HEALTH, 'down')
    new Sprite(node, ['basic', 'down', 0])
  }

  public nextFrame() {
    if (this.health <= 0) {
      this.getNode().remove()
      return false
    }

    this.incrementInvulnerability()
    return true
  }
}
