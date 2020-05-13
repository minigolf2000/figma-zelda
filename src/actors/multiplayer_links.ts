import { Link } from "../link"

let l: MultiplayerLinks
export function getMultiplayerLinks() {
  return l
}

export class MultiplayerLinks {
  private multiplayerLinks: Link[] = []

  public constructor(nodes: FrameNode[]) {
    nodes.forEach(n => n.setRelaunchData({relaunch: ''}))
    this.multiplayerLinks = nodes.map(n => new Link(n))
    l = this
  }

  public getAll() {
    return this.multiplayerLinks
  }

  public nextFrame() {
    this.multiplayerLinks.forEach(l => {
      l.updateButtonsPressedFromPluginData()
      l.nextFrame()
    })
  }
}