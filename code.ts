// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".

let linkNode: InstanceNode = null
let worldNode: FrameNode
let sprites: Sprites = null
let walls = {}

function main() {
  if (!figma.currentPage.selection) {
    figma.closePlugin("Please have Link selected while running the Plugin")
    return false
  }

  if (figma.currentPage.selection[0].type !== 'INSTANCE') {
    figma.closePlugin("Selected node must be an instance, whose master lives in 'sprites' frame")
    return false
  }

  linkNode = figma.currentPage.selection[0]
  sprites = loadSprites(linkNode)
  if (!sprites) {
    figma.closePlugin("Error loading sprites")
    return false
  }
  if (linkNode.parent.type !== 'FRAME') {
    figma.closePlugin("World must be a frame")
    return
  }
  worldNode = linkNode.parent

  walls = loadWalls()
  console.log(walls)
  return true
}

figma.showUI(__html__);

// let health = event.data.pluginMessage.health
// let newHealth = ''
// while (health >= 1) {
//   newHealth += '💗'
//   health -= 1
// }
// while (event.data.pluginMessage.health >= .5) {
//   newHealth += '💔'
// }

// newevent.data.pluginMessage.health
//  event.data.pluginMessage.health.re

figma.ui.postMessage({health: '💗💗💗'})
const FPS = 60
interface Buttons {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  action: boolean
}
const keysPressed: Buttons = {
  up: false, down: false, left: false, right: false, action: false
}

interface State {
  health: number
  x: number
  y: number
  swordActiveFrame?: number
}
const linkState = {

}
figma.ui.onmessage = msg => {
  switch (msg.keyCode as number) {
    case 13: // ENTER
    case 16: // SHIFT
    case 17: // CTRL
    case 18: // ALT
    case 32: // SPACE
      keysPressed.action = (msg.type === 'keydown') ? true : false
      break
    case 37: // LEFT_ARROW
    case 65: // A
      keysPressed.left = (msg.type === 'keydown') ? true : false
      break
    case 38: // UP_ARROW
    case 87: // W
      keysPressed.up = (msg.type === 'keydown') ? true : false
      break
    case 39: // RIGHT_ARROW
    case 68: // D
      keysPressed.right = (msg.type === 'keydown') ? true : false
      break
    case 40: // DOWN_ARROW
    case 83: // S
      keysPressed.down = (msg.type === 'keydown') ? true : false
      break
}

// Call this when Link dies
// figma.closePlugin();
};

function nextFrame() {
  if (keysPressed.action) {
    action()
  }
  if (keysPressed.left) {
    moveLeft()
  }
  if (keysPressed.up) {
    moveUp()
  }
  if (keysPressed.right) {
    moveRight()
  }
  if (keysPressed.down) {
    moveDown()
  }
}

function action() {
  console.log("action")
}

function moveLeft() {
  console.log("moveLeft")
  linkNode.masterComponent = sprites['side'][0]
  const newX = linkNode.x - 4
  const newY = linkNode.y

  if (isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

function isColliding(x: number, y: number) {
  if (x < 0 || y < 0 || x > worldNode.width || y > worldNode.height) {
    return true
  }
  return (
    walls[Math.floor(x / 16) * 16]?.[Math.floor(y / 16) * 16] ||
    walls[Math.floor(x / 16) * 16]?.[Math.ceil(y / 16) * 16] ||
    walls[Math.ceil(x / 16) * 16]?.[Math.floor(y / 16) * 16] ||
    walls[Math.ceil(x / 16) * 16]?.[Math.ceil(y / 16) * 16]
  )
}
function moveUp() {
  console.log("moveUp")
  linkNode.masterComponent = sprites['up'][0]
  const newX = linkNode.x
  const newY = linkNode.y - 4

  if (isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

function moveRight() {
  linkNode.masterComponent = sprites['side'][0]
  const newX = linkNode.x + 4
  const newY = linkNode.y

  if (isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

function moveDown() {
  linkNode.masterComponent = sprites['down'][0]
  const newX = linkNode.x
  const newY = linkNode.y + 4

  if (isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

interface Sprites {
  [side: string]: ComponentNode[]
}

function loadSprites(link: InstanceNode) {
  const sprites: Sprites = {}

  let spritesFrame = link.masterComponent.parent
  while (spritesFrame.parent && spritesFrame.name !== 'sprites') {
    spritesFrame = spritesFrame.parent
  }
  if (spritesFrame.name !== 'sprites') {
    return null
  }

  const basic = spritesFrame.children.find(n => n.name === 'basic' && n.type === 'FRAME') as InstanceNode
  
  sprites['down'] = [
    basic.children.find(n => n.name === 'down_0') as ComponentNode,
    basic.children.find(n => n.name === 'down_1') as ComponentNode
  ]
  sprites['side'] = [
    basic.children.find(n => n.name === 'side_0') as ComponentNode,
    basic.children.find(n => n.name === 'side_1') as ComponentNode
  ]
  sprites['up'] = [
    basic.children.find(n => n.name === 'up_0') as ComponentNode,
    basic.children.find(n => n.name === 'up_1') as ComponentNode
  ]
  return sprites
}

function loadWalls() {
  const walls = {}
  worldNode.children.forEach((node: SceneNode) => {
    if (node.name === 'tree' || node.name.includes('rock')) {
      if (!walls[node.x]) {walls[node.x] = {}}
      walls[node.x][node.y] = true
    }
  })

  return walls
}
if (main()) {
  setInterval(nextFrame, 1000 / FPS)
}