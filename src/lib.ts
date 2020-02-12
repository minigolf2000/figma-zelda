export const FPS = 30
export const WALK_SPEED = 3
export const KNOCKBACK_DISTANCE = 16

export type Facing = 'up' | 'down' | 'left' | 'right'

export function displayHealth(current: number, max: number) {
  const missing = max - current
  let displayHealth = ''
  while (current >= 1) {
    displayHealth += '💗'
    current -= 1
  }
  if (current >= .5) {
    displayHealth += '💔'
  }
  Array.from(Array(Math.floor(missing))).forEach((x, i) => {
    displayHealth += '🖤'
  })
  return displayHealth
}

export function updateCamera(linkNode: SceneNode, worldNode: FrameNode) {
  const distFromCenter = 300 / figma.viewport.zoom
  const currentX = linkNode.x + worldNode.x
  const currentY = linkNode.y + worldNode.y

  let newX = figma.viewport.center.x
  if (figma.viewport.center.x - currentX > distFromCenter) {
    newX -= figma.viewport.center.x - currentX - distFromCenter
  } else if (currentX - figma.viewport.center.x > distFromCenter) {
    newX += currentX - figma.viewport.center.x - distFromCenter
  }

  let newY = figma.viewport.center.y
  if (figma.viewport.center.y - currentY > distFromCenter) {
    newY -= figma.viewport.center.y - currentY - distFromCenter
  } else if (currentY - figma.viewport.center.y > distFromCenter) {
    newY += currentY - figma.viewport.center.y - distFromCenter
  }

  if (newX !== figma.viewport.center.x || newY !== figma.viewport.center.y) {
    figma.viewport.center = {x: newX, y: newY}
  }
}

export function rotation(facing: Facing) {
  switch (facing) {
    case 'up':
      return 0
    case 'left':
      return 90
    case 'down':
      return 180
    case 'right':
      return 270
  }
}

