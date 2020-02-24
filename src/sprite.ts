interface SpriteMap {
  [name: string]: SceneNode
}

export class Sprite {
  private currentSpriteNode: SceneNode
  private sprites: SpriteMap

  public constructor(characterNode: InstanceNode) {
    let firstSprite: string[] | null = null
    this.sprites = characterNode
        .findAll((node: SceneNode) => node.type === 'INSTANCE' || node.type === 'FRAME')
        .reduce((map: SpriteMap, node: SceneNode) => {
      if (!firstSprite) {
        firstSprite = node.name.split("-")
      }
      map[node.name] = node
      node.visible = false
      return map
    }, {})

    if (firstSprite) {
      this.setSprite(firstSprite)
    }
  }

  public setSprite(spriteArray: (string|number)[]) {
    const node = this.sprites[spriteArray.join("-")]

    if (!node) {
      throw `Could not find sprite name ${spriteArray.join("-")} in list ${JSON.stringify(this.sprites)}`
    }

    if (node.name === this.currentSpriteNode?.name) {
      return
    }

    if (this.currentSpriteNode) this.currentSpriteNode.visible = false
    node.visible = true
    this.currentSpriteNode = node
  }
}