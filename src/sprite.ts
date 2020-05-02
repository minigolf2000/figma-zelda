interface SpriteMap {
  [name: string]: SceneNode
}

export class Sprite {
  private currentSpriteNodeName: string
  private nodeNamesMap: Set<string> = new Set()
  private sprites: SpriteMap

  public constructor(characterNode: FrameNode, initialSpriteArray?: (string|number)[]) {
    let firstSprite: string[] | null = null
    this.sprites = characterNode
        .findAll((node: SceneNode) => node.type === 'INSTANCE' || node.type === 'FRAME')
        .reduce((map: SpriteMap, node: SceneNode) => {
      if (!firstSprite) {
        firstSprite = node.name.split("-")
      }
      map[node.name] = node

      this.nodeNamesMap.add(node.name)

      node.visible = false
      return map
    }, {})

    if (initialSpriteArray) this.setSprite(initialSpriteArray)
  }

  public setSprite(spriteArray: (string|number)[]) {
    const spriteName = spriteArray.join("-")

    if (!this.nodeNamesMap.has(spriteName)) {
      throw `Could not find sprite name ${spriteArray.join("-")} in list ${JSON.stringify(this.sprites)}`
    }

    if (spriteName === this.currentSpriteNodeName) {
      return
    }

    if (this.currentSpriteNodeName) this.sprites[this.currentSpriteNodeName].visible = false
    this.sprites[spriteName].visible = true
    this.currentSpriteNodeName = spriteName
  }
}