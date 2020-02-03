// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
// This shows the HTML page in "ui.html".
const FPS = 60;
function nextFrame() {
}
function init() {
    figma.showUI(__html__);
    if (figma.currentPage.selection[0].type !== 'INSTANCE') {
        figma.closePlugin("Selected node must be an instance, whose master lives in 'sprites' frame");
        return;
    }
    const link = figma.currentPage.selection[0];
    const sprites = loadSprites(link);
    if (!sprites) {
        figma.closePlugin("Error loading sprites");
        return;
    }
    console.log(sprites);
    figma.ui.onmessage = msg => {
        if (msg.type === 'keydown') {
            switch (msg.keyCode) {
                case 13: // ENTER
                case 16: // SHIFT
                case 17: // CTRL
                case 18: // ALT
                case 32: // SPACE
                    action(link, sprites);
                    break;
                case 37: // LEFT_ARROW
                case 65: // A
                    moveLeft(link, sprites);
                    break;
                case 38: // UP_ARROW
                case 87: // W
                    moveUp(link, sprites);
                    break;
                case 39: // RIGHT_ARROW
                case 68: // D
                    moveRight(link, sprites);
                    break;
                case 40: // DOWN_ARROW
                case 83: // S
                    moveDown(link, sprites);
                    break;
            }
        }
        // Call this when Link dies
        // figma.closePlugin();
    };
}
function action(link, sprites) {
    console.log("action");
}
function moveLeft(link, sprites) {
    console.log("moveLeft");
    link.masterComponent = sprites['side'][0];
    link.x -= 2;
}
function moveUp(link, sprites) {
    console.log("moveUp");
    link.masterComponent = sprites['up'][0];
    link.y -= 2;
}
function moveRight(link, sprites) {
    link.masterComponent = sprites['side'][0];
    console.log("moveRight");
    link.x += 2;
}
function moveDown(link, sprites) {
    link.masterComponent = sprites['down'][0];
    console.log("moveDown");
    link.y += 2;
}
function loadSprites(link) {
    const sprites = {};
    let spritesFrame = link.masterComponent.parent;
    while (spritesFrame.parent && spritesFrame.name !== 'sprites') {
        spritesFrame = spritesFrame.parent;
    }
    if (spritesFrame.name !== 'sprites') {
        return null;
    }
    const basic = spritesFrame.children.find(n => n.name === 'basic' && n.type === 'FRAME');
    sprites['down'] = [
        basic.children.find(n => n.name === 'down_0'),
        basic.children.find(n => n.name === 'down_1')
    ];
    sprites['side'] = [
        basic.children.find(n => n.name === 'side_0'),
        basic.children.find(n => n.name === 'side_1')
    ];
    sprites['up'] = [
        basic.children.find(n => n.name === 'up_0'),
        basic.children.find(n => n.name === 'up_1')
    ];
    return sprites;
}
init();
setInterval(nextFrame, 1000 / FPS);
