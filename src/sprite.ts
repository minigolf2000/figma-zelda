export class Sprite {
  private linkNode: InstanceNode
  private currentSpriteNode: SceneNode

  public constructor(linkNode: InstanceNode) {
    this.linkNode = linkNode
    this.setSprite("basic", "down_0")
  }

  public setSprite(folder: string, name: string) {
    if (this.currentSpriteNode) this.currentSpriteNode.visible = false

    const newNode = (this.linkNode.children.find(n => n.name === folder) as FrameNode).children.find(n => n.name === name);
    newNode.visible = true;
    this.currentSpriteNode = newNode;
  }
}



// import { Sprite } from './sprite'
// new Sprite()

// interface Enemy {
//   nextFrame(): void

// }