import { FPS, WALK_SPEED, DIAG_WALK_SPEED } from './lib'
import { Sprite } from './sprite'

// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".

let linkNode: InstanceNode = null
let worldNode: FrameNode
let walls = {}
let sprite: Sprite | null = null

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
  if (linkNode.parent.type !== 'FRAME') {
    figma.closePlugin("World must be a frame")
    return
  }
  worldNode = linkNode.parent;
  sprite = new Sprite(linkNode);
  walls = loadWalls()

  return true
}

figma.showUI(__html__);

function displayHealth(current: number, max: number) {
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
  });
  return displayHealth
}

figma.ui.postMessage({health: displayHealth(3, 3)})

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
  walkingFrame: number
  swordActiveFrame: number | null
}

const linkState: State = {
  health: 3,
  walkingFrame: 0,
  swordActiveFrame: null,
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
  let walking = false

  if (keysPressed.action && linkState.swordActiveFrame === null) {
    linkState.swordActiveFrame = 0
  } else if (linkState.swordActiveFrame !== null) {
    linkState.swordActiveFrame++
    if (linkState.swordActiveFrame === 3) linkState.swordActiveFrame = null
  }
    
    
  if (keysPressed.left && !keysPressed.right) {
    moveLeft(keysPressed.up === keysPressed.down)
    walking = true
  }
  if (keysPressed.right && !keysPressed.left) {
    moveRight(keysPressed.up === keysPressed.down)
    walking = true
  }
  if (keysPressed.up && !keysPressed.down) {
    moveUp(keysPressed.left === keysPressed.right)
    walking = true
  }
  if (keysPressed.down && !keysPressed.up) {
    moveDown(keysPressed.left === keysPressed.right)
    walking = true
  }
  
  if (walking) {
    if (linkState.walkingFrame === 4) linkState.walkingFrame = 0
    else linkState.walkingFrame++
  }
  if (linkState.swordActiveFrame) {
    if (linkState.swordActiveFrame > 0) (linkNode.children.find(n => n.name === 'sword') as FrameNode).children.find(n => n.name === `up_${linkState.swordActiveFrame - 1}`).visible = false;
    (linkNode.children.find(n => n.name === 'sword') as FrameNode).children.find(n => n.name === `up_${linkState.swordActiveFrame}`).visible = true;
  }
    
    
}

function action() {
  console.log("action")
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
  
function moveLeft(fast: boolean) {
  const velocity = fast ? WALK_SPEED : DIAG_WALK_SPEED
  sprite.setSprite('basic', `left_${linkState.walkingFrame > 2 ? 1 : 0}`)

  const newX = linkNode.x - velocity
  const newY = linkNode.y

  if (isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

function moveUp(fast: boolean) {
  const velocity = fast ? WALK_SPEED : DIAG_WALK_SPEED
  sprite.setSprite('basic', `up_${linkState.walkingFrame > 2 ? 1 : 0}`)
  const newX = linkNode.x
  const newY = linkNode.y - velocity

  if (isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

function moveRight(fast: boolean) {
  const velocity = fast ? WALK_SPEED : DIAG_WALK_SPEED
  sprite.setSprite('basic', `right_${linkState.walkingFrame > 2 ? 1 : 0}`)
  const newX = linkNode.x + velocity
  const newY = linkNode.y

  if (isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
}

function moveDown(fast: boolean) {
  const velocity = fast ? WALK_SPEED : DIAG_WALK_SPEED
  sprite.setSprite('basic', `down_${linkState.walkingFrame > 2 ? 1 : 0}`)
  const newX = linkNode.x
  const newY = linkNode.y + velocity

  if (isColliding(newX, newY)) {
    return
  }
  linkNode.x = newX; linkNode.y = newY
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