const DEFAULT_SPRITE = ["basic", "down", 0]

export class Sprite {
  private characterNode: InstanceNode
  private currentSpriteNode: SceneNode

  public constructor(characterNode: InstanceNode) {
    this.characterNode = characterNode
    characterNode.findAll((node: SceneNode) => node.type === 'INSTANCE').forEach((node: SceneNode) => node.visible = false)
    this.setSprite(DEFAULT_SPRITE)
  }

  public setSprite(spriteArray: (string|number)[]) {
    const node = this.characterNode.children.find((node: SceneNode) => node.name === spriteArray.join("-"))

    if (node.name === this.currentSpriteNode?.name) {
      return
    }

    if (this.currentSpriteNode) this.currentSpriteNode.visible = false
    node.visible = true
    this.currentSpriteNode = node
  }
}