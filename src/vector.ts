import { Rectangle } from "./tiles"

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

  public add(vector: Vector) {
    this.x += vector.x
    this.y += vector.y
    return this
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

