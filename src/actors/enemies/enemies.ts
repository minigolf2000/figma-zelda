import { OctorokRed, OctorokBlue } from "./octorok"
import { MoblinBlue, MoblinRed } from "./moblin"
import { Actor } from "../actor"
import { LynelRed } from "./lynel_red"
import { Scarecrow } from "./scarecrow"

let e: Enemies
export function getEnemies() {
  return e
}

export class Enemies {
  private enemies: Actor[] = []

  public constructor(nodes: FrameNode[]) {
    nodes.forEach((node: FrameNode) => {
      switch (node.name) {
        case 'octorok-red':
          this.enemies.push(new OctorokRed(node))
          break
        case 'octorok-blue':
          this.enemies.push(new OctorokBlue(node))
          break
        case 'moblin-red':
          this.enemies.push(new MoblinRed(node))
          break
        case 'moblin-blue':
          this.enemies.push(new MoblinBlue(node))
          break
        case 'lynel-red':
          this.enemies.push(new LynelRed(node))
          break
        case 'scarecrow':
          this.enemies.push(new Scarecrow(node))
          break
      }
    })
    e = this
  }

  public getAll() {
    return this.enemies
  }

  public setAll(e: Actor[]) {
    this.enemies = e
  }

  public removeAll() {
    this.enemies.forEach(e => e.getNode().remove())
    this.enemies = []
  }

  public nextFrame() {
    this.enemies.forEach(enemy => enemy.nextFrame())
  }
}