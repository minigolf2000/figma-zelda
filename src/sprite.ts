export class Sprite {
  private linkNode: InstanceNode
  private currentSprite: string[]

  public constructor(linkNode: InstanceNode) {
    this.setSprite("basic", "down_0")
  }

  public setSprite(folder: string, name: string) {
    (this.linkNode.children.find(n => n.name === this.currentSprite[0]) as FrameNode).children.find(n => n.name === this.currentSprite[1]).visible = false;
    (this.linkNode.children.find(n => n.name === folder) as FrameNode).children.find(n => n.name === name).visible = true;
    this.currentSprite = [folder, name]
  }
}



// import { Sprite } from './sprite'
// new Sprite()

interface Enemy {
  nextFrame(): void

}