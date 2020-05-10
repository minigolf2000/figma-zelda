import { Enemies } from './actors/enemies/enemies'
import { getItems, Items } from './actors/items'
import { onKeyPressed } from './buttons'
import { displayHealth, displayTriforceShards, findNodesInWorld, getLink, getWorldNode, setLink, setTriforceShardsTotal, setWorldNode, setWorldPosition, updateCamera } from './lib'
import { Link } from './link'
import { lintWorld, snapTilesToGrid, Tiles } from './tiles'


let templateWorldNode: FrameNode

export function init() {
  let templateLinkNode = findLinkNode()
  if (!templateLinkNode) {
    figma.closePlugin("Please have Link selected while running the Plugin")
    return false
  }

  templateWorldNode = findNearestFrameAncestor(templateLinkNode)
  if (templateWorldNode.getPluginData("running-world") ===  "true") {
    figma.closePlugin("Multiplayer is not supported yet!")
    return false
  }

  snapTilesToGrid(templateWorldNode)
  lintWorld(templateWorldNode)
  templateWorldNode.visible = false
  templateLinkNode.setPluginData("player-one", "true")

  const worldNode = templateWorldNode.clone()
  worldNode.setPluginData("running-world", "true")
  setWorldNode(worldNode)
  worldNode.visible = true

  const nodesInWorld = findNodesInWorld(worldNode)
  new Tiles(worldNode, nodesInWorld.tiles)
  new Items(nodesInWorld.items)
  new Enemies(nodesInWorld.enemies)
  setLink(new Link(nodesInWorld.link!))
  setTriforceShardsTotal(getItems().triforceShardTotal())

  templateLinkNode.setPluginData("player-one", "") // reset this to initial value
  templateWorldNode.setRelaunchData({relaunch: ''})
  figma.currentPage.setRelaunchData({relaunch: ''})
  figma.currentPage.selection = []

  figma.viewport.zoom = 3.5
  setWorldPosition(getWorldNode())
  updateCamera(getLink().getCurrentCollision(), 0)

  figma.showUI(__html__, {width: 260, height: 160})
  figma.ui.postMessage({health: displayHealth(3, 3)})
  figma.ui.postMessage({triforceShards: displayTriforceShards()})
  figma.ui.postMessage({setSword: 'wooden-sword'})
  figma.ui.onmessage = onKeyPressed

  return true
}

function findLinkNode() {
  const isPlayableLink = (node: BaseNode) => node.type === 'INSTANCE' && node.name === 'link' && node.parent?.type !== 'PAGE'
  let firstSelectedNode: (BaseNode & ChildrenMixin) | null = figma.currentPage.selection[0] as BaseNode & ChildrenMixin

  // Search for link starting from Page if no selection
  if (!firstSelectedNode) {
    return figma.currentPage.findOne(node => isPlayableLink(node)) as InstanceNode
  }

  // If selecting an invalid search point, walk up the tree until selecting a valid search point
  while (firstSelectedNode && firstSelectedNode.type !== 'PAGE' && firstSelectedNode.type !== 'FRAME' && firstSelectedNode.name !== 'link') {
    firstSelectedNode = firstSelectedNode.parent!
  }

  // Now we are selecting a valid search point

  // Return this node
  if (isPlayableLink(firstSelectedNode)) {
    return firstSelectedNode as InstanceNode
  }

  // Search for a valid link
  if (firstSelectedNode.type === 'FRAME') {
    return firstSelectedNode.findOne(node => isPlayableLink(node)) as InstanceNode
  }

  return null
}

const findNearestFrameAncestor = (node: BaseNode) => {
  let current: any = node
  while (current) {
    if (current.type === 'FRAME') { return current }
    current = current.parent
  }
}

figma.on("close", () => {
  if (getWorldNode()) getWorldNode().remove()
  if (templateWorldNode) templateWorldNode.visible = true
})
