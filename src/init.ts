import { Enemies } from './actors/enemies/enemies'
import { getItems, Items } from './actors/items'
import { onButtonsPressed } from './buttons'
import { displayHealth, displayTriforceShards, findNodesInWorld, getLink, getWorldNode, setLink, setTriforceShardsTotal, setWorldNode, setWorldPosition, updateCamera } from './lib'
import { Link } from './link'
import { lintWorld, snapTilesToGrid, Tiles } from './tiles'
import { MultiplayerLinks } from './actors/multiplayer_links'

export enum initReturnValue {
  server = 0,
  client = 1,
  error = 2,
}

export function init() {
  let templateLinkNode = findLinkNode()
  if (!templateLinkNode) {
    figma.closePlugin("Please have Link selected while running the Plugin")
    return initReturnValue.error
  }

  let templateWorldNode = findNearestFrameAncestor(templateLinkNode)!
  if (templateWorldNode.getPluginData("running-world") ===  "true") {
    return initClientMode(templateLinkNode as FrameNode, templateWorldNode)
  }

  // TODO: figure out if player is player-one or not
  snapTilesToGrid(templateWorldNode)
  lintWorld(templateWorldNode)
  templateWorldNode.visible = false
  templateLinkNode.setPluginData("player-one", "true")

  const worldNode = templateWorldNode.clone()
  worldNode.setPluginData("running-world", "true")
  setWorldNode(worldNode)
  worldNode.expanded = false // collapse this for performance by avoiding layers panel rerenders
  worldNode.visible = true

  const nodesInWorld = findNodesInWorld(worldNode)
  new Tiles(worldNode, nodesInWorld.tiles)
  new Items(nodesInWorld.items)
  new Enemies(nodesInWorld.enemies)
  new MultiplayerLinks(nodesInWorld.multiplayerLinks)
  setLink(new Link(nodesInWorld.link!))
  setTriforceShardsTotal(getItems().triforceShardTotal())

  templateLinkNode.setPluginData("player-one", "") // reset this to initial value
  templateLinkNode.setRelaunchData({relaunch: ''})
  templateWorldNode.setRelaunchData({relaunch: ''})
  figma.currentPage.setRelaunchData({relaunch: ''})
  figma.currentPage.selection = []

  sharedSetup()
  figma.on("close", () => {
    getWorldNode().remove()
    templateWorldNode.visible = true
  })

  return initReturnValue.server
}

function findLinkNode() {
  const isPlayableLink = (node: BaseNode) => node.name === 'link' && node.parent?.type !== 'PAGE'
  let firstSelectedNode: (BaseNode & ChildrenMixin) | null = figma.currentPage.selection[0] as BaseNode & ChildrenMixin

  // Search for link starting from Page if no selection
  if (!firstSelectedNode) {
    return figma.currentPage.findOne(node => isPlayableLink(node)) as InstanceNode | FrameNode
  }

  // If selecting an invalid search point, walk up the tree until selecting a valid search point
  let searchPoint = firstSelectedNode
  if (firstSelectedNode.name !== 'link') {
    searchPoint = findNearestFrameAncestor(firstSelectedNode) || firstSelectedNode
  }

  // Now we are selecting a valid search point, which is either:
  // a Link node
  // the nearest frame ancestor

  // Return this node
  if (isPlayableLink(searchPoint)) {
    return searchPoint as InstanceNode | FrameNode
  }

  // Search for a valid link
  if (searchPoint.type === 'FRAME') {
    return searchPoint.findOne(node => isPlayableLink(node)) as InstanceNode | FrameNode
  }

  return null
}

const findNearestFrameAncestor = (node: BaseNode & ChildrenMixin) => {
  let current: (BaseNode & ChildrenMixin) | null = node.parent
  while (current) {
    if (current.type === 'FRAME') { return current as FrameNode }
    current = current.parent
  }
  return null
}

const sharedSetup = () => {
  figma.viewport.zoom = 3.5
  setWorldPosition(getWorldNode())
  updateCamera(getLink().getCurrentCollision(), 0) // center Link in viewport

  figma.showUI(__html__, {width: 260, height: 160})
  figma.ui.postMessage({health: displayHealth(3, 3)})
  figma.ui.postMessage({triforceShards: displayTriforceShards()})
  figma.ui.postMessage({setSword: 'wooden-sword'})
  figma.ui.onmessage = (m) => onButtonsPressed(m, getLink().buttonsPressed)
}

const initClientMode = (linkNode: FrameNode, worldNode: FrameNode) => {
  if (linkNode.getPluginData("active") === "true") {
    figma.closePlugin("Please select a Link that is not already taken")
    return initReturnValue.error
  }

  linkNode.setPluginData("active", "true")
  setWorldNode(worldNode)
  setLink(new Link(linkNode))

  figma.on("close", () => {
    linkNode.setPluginData("active", "")
  })

  sharedSetup()
  return initReturnValue.client
}
