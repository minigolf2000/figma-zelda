const DEFAULT_SPRITE = ["basic", "down", 0]

interface SpriteMap {
  [name: string]: SceneNode
}

export class Sprite {
  private currentSpriteNode: SceneNode
  private sprites: SpriteMap

  public constructor(characterNode: InstanceNode) {
    this.sprites = characterNode.findAll((node: SceneNode) => node.type === 'INSTANCE').reduce((map: SpriteMap, node: SceneNode) => {
      map[node.name] = node
      node.visible = false
      return map
    }, {})
    this.setSprite(DEFAULT_SPRITE)
  }

  public setSprite(spriteArray: (string|number)[]) {
    const node = this.sprites[spriteArray.join("-")]

    if (node.name === this.currentSpriteNode?.name) {
      return
    }

    if (this.currentSpriteNode) this.currentSpriteNode.visible = false
    node.visible = true
    this.currentSpriteNode = node
  }
}