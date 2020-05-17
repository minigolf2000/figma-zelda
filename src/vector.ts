import { Rectangle } from "./tiles"
import { Facing } from "./lib"
// Helper methods on Figma's Vector type

export function direction(a: Rectangle, b: Rectangle): Vector {
  const aMidpoint = [a.x + a.width, a.y + a.height]
  const bMidpoint = [b.x + b.width, b.y + b.height]

  return {x: aMidpoint[0] - bMidpoint[0], y: aMidpoint[1] - bMidpoint[1]}
}

export function add(v1: Vector, v2: Vector): Vector {
  return {x: v1.x + v2.x, y: v1.y + v2.y}
}

export function distance(v1: Vector, v2: Vector): number {
  const a = v1.x - v2.x
  const b = v1.y - v2.y
  return Math.sqrt(a * a + b * b)
}

export function multiply(v1: Vector, magnitude: number): Vector {
  return {x: v1.x * magnitude, y: v1.y * magnitude}
}

export function normalize(v: Vector): Vector {
  const length = magnitude(v)
  return {x: v.x / length, y: v.y / length}
}

export function vectorToFacing(v: Vector): Facing {
  const theta = Math.atan(v.y / v.x)
  if (Math.abs(theta * 2 / Math.PI) < .5) {
    return (v.x > 0) ? 'right' : 'left'
  } else {
    return (v.y > 0) ? 'down' : 'up'
  }
}

export function facingToVector(f: Facing): Vector {
  switch (f) {
    case 'up':
      return {x: 0, y: -1}
    case 'down':
      return {x: 0, y: 1}
    case 'left':
      return {x: -1, y: 0}
    case 'right':
      return {x: 1, y: 0}
    default:
      throw 'Invalid facing'
  }
}

export function magnitude(v: Vector): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}