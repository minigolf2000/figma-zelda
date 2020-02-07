import { Sprite } from "./sprite";

export function loadEnemies(worldNode: FrameNode, linkNode: InstanceNode) {
  const enemies: OctorokRed[] = []
  worldNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: InstanceNode) => {
    switch (node.name) {
      case 'octorok_red':
        enemies.push(new OctorokRed(node, linkNode))
        break
      // case 37: // LEFT_ARROW
      // case 65: // A
    }
  });
  return enemies
}



export class OctorokRed {
  private node: InstanceNode
  private linkNode: InstanceNode
  private sprite: Sprite
  private walkingFrame: number = 0

  public constructor(node: InstanceNode, linkNode: InstanceNode) {
    this.node = node
    this.linkNode = linkNode
    this.sprite = new Sprite(node)
  }

  public nextFrame() {
    
  this.sprite.setSprite(['basic', 'up', this.walkingFrame > 2 ? 1 : 0])
  const newX = this.node.x
  const newY = this.node.y - 2

  // if (isColliding(newX, newY)) {
  //   return
  // }
  this.node.x = newX; this.node.y = newY
  }
}
  