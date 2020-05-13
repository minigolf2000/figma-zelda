import { Link } from "../link"
import { ClientMessages } from "../lib"

let l: MultiplayerLinks
export function getMultiplayerLinks() {
  return l
}

export class MultiplayerLinks {
  private multiplayerLinks: Link[] = []

  public constructor(nodes: FrameNode[]) {
    this.multiplayerLinks = nodes.map(n => new Link(n))
    l = this
  }

  public getAll() {
    return this.multiplayerLinks
  }

  public nextFrame() {
    this.multiplayerLinks.forEach(l => {
      l.updateButtonsPressedFromPluginData()
      const stillAlive = l.nextFrame()
      if (!stillAlive) {
        const messages = JSON.parse(l.getNode().getPluginData("messages") || "{}") as ClientMessages
        messages.death = true
        l.getNode().setPluginData("messages", JSON.stringify(messages))
      }
      return stillAlive
    })
  }
}