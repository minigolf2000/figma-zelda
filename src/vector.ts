import { Facing } from "./lib"
import { Rectangle } from "./collision"

export function facingToVector(facing: Facing) {
  switch (facing) {
    case 'up':
      return new Vector(0, -1)
    case 'down':
      return new Vector(0, 1)
    case 'left':
      return new Vector(-1, 0)
    case 'right':
      return new Vector(1, 0)
    // default:
    //   assertNever()
  }
}

export function rectsToVector(a: Rectangle, b: Rectangle) {
  const aMidpoint = [a.x + a.width, a.y + a.height]
  const bMidpoint = [b.x + b.width, b.y + b.height]

  return (new Vector(aMidpoint[0] - bMidpoint[0], aMidpoint[1] - bMidpoint[1])).normalize()
}

export class Vector {
  public x: number
  public y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  public multiply(magnitude: number) {
    this.x *= magnitude
    this.y *= magnitude
    return this
  }

  public normalize() {
    var length = Math.sqrt(this.x * this.x + this.y * this.y) // calculating length
    if (length > 0) {
      this.x = this.x / length // assigning new value to x (dividing x by length of the vector)
      this.y = this.y / length // assigning new value to y
    }
    return this
  }

}

