/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/code.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/code.ts":
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
// This shows the HTML page in "ui.html".
let linkNode = null;
let worldNode;
let walls = {};
function main() {
    if (!figma.currentPage.selection) {
        figma.closePlugin("Please have Link selected while running the Plugin");
        return false;
    }
    if (figma.currentPage.selection[0].type !== 'INSTANCE') {
        figma.closePlugin("Selected node must be an instance, whose master lives in 'sprites' frame");
        return false;
    }
    linkNode = figma.currentPage.selection[0];
    if (linkNode.parent.type !== 'FRAME') {
        figma.closePlugin("World must be a frame");
        return;
    }
    worldNode = linkNode.parent;
    walls = loadWalls();
    console.log(walls);
    return true;
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
figma.ui.postMessage({ health: '💗💗💗' });
const FPS = 30;
const keysPressed = {
    up: false, down: false, left: false, right: false, action: false
};
const linkState = {
    health: 3,
    walkingFrame: 0,
};
figma.ui.onmessage = msg => {
    switch (msg.keyCode) {
        case 13: // ENTER
        case 16: // SHIFT
        case 17: // CTRL
        case 18: // ALT
        case 32: // SPACE
            keysPressed.action = (msg.type === 'keydown') ? true : false;
            break;
        case 37: // LEFT_ARROW
        case 65: // A
            keysPressed.left = (msg.type === 'keydown') ? true : false;
            break;
        case 38: // UP_ARROW
        case 87: // W
            keysPressed.up = (msg.type === 'keydown') ? true : false;
            break;
        case 39: // RIGHT_ARROW
        case 68: // D
            keysPressed.right = (msg.type === 'keydown') ? true : false;
            break;
        case 40: // DOWN_ARROW
        case 83: // S
            keysPressed.down = (msg.type === 'keydown') ? true : false;
            break;
    }
    // Call this when Link dies
    // figma.closePlugin();
};
function nextFrame() {
    console.log(linkState);
    let walking = false;
    if (keysPressed.action) {
        action();
    }
    if (keysPressed.left && !keysPressed.right) {
        moveLeft(keysPressed.up === keysPressed.down ? 3.5 : 2.8);
        walking = true;
    }
    if (keysPressed.right && !keysPressed.left) {
        moveRight(keysPressed.up === keysPressed.down ? 3.5 : 2.8);
        walking = true;
    }
    if (keysPressed.up && !keysPressed.down) {
        moveUp(keysPressed.left === keysPressed.right ? 3.5 : 2.8);
        walking = true;
    }
    if (keysPressed.down && !keysPressed.up) {
        moveDown(keysPressed.left === keysPressed.right ? 3.5 : 2.8);
        walking = true;
    }
    if (walking) {
        if (linkState.walkingFrame === 4)
            linkState.walkingFrame = 0;
        else
            linkState.walkingFrame++;
    }
}
function action() {
    // console.log("action")
}
function isColliding(x, y) {
    var _a, _b, _c, _d;
    if (x < 0 || y < 0 || x > worldNode.width || y > worldNode.height) {
        return true;
    }
    return (((_a = walls[Math.floor(x / 16) * 16]) === null || _a === void 0 ? void 0 : _a[Math.floor(y / 16) * 16]) || ((_b = walls[Math.floor(x / 16) * 16]) === null || _b === void 0 ? void 0 : _b[Math.ceil(y / 16) * 16]) || ((_c = walls[Math.ceil(x / 16) * 16]) === null || _c === void 0 ? void 0 : _c[Math.floor(y / 16) * 16]) || ((_d = walls[Math.ceil(x / 16) * 16]) === null || _d === void 0 ? void 0 : _d[Math.ceil(y / 16) * 16]));
}
function setAllBasicSpritesInvisible(linkNode) {
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === 'left_0').visible = false;
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === 'right_0').visible = false;
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === 'down_0').visible = false;
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === 'up_0').visible = false;
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === 'left_1').visible = false;
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === 'right_1').visible = false;
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === 'down_1').visible = false;
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === 'up_1').visible = false;
}
function moveLeft(velocity) {
    setAllBasicSpritesInvisible(linkNode);
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === `left_${linkState.walkingFrame > 2 ? 1 : 0}`).visible = true;
    const newX = linkNode.x - velocity;
    const newY = linkNode.y;
    if (isColliding(newX, newY)) {
        return;
    }
    linkNode.x = newX;
    linkNode.y = newY;
}
function moveUp(velocity) {
    setAllBasicSpritesInvisible(linkNode);
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === `up_${linkState.walkingFrame > 2 ? 1 : 0}`).visible = true;
    const newX = linkNode.x;
    const newY = linkNode.y - velocity;
    if (isColliding(newX, newY)) {
        return;
    }
    linkNode.x = newX;
    linkNode.y = newY;
}
function moveRight(velocity) {
    setAllBasicSpritesInvisible(linkNode);
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === `right_${linkState.walkingFrame > 2 ? 1 : 0}`).visible = true;
    const newX = linkNode.x + velocity;
    const newY = linkNode.y;
    if (isColliding(newX, newY)) {
        return;
    }
    linkNode.x = newX;
    linkNode.y = newY;
}
function moveDown(velocity) {
    setAllBasicSpritesInvisible(linkNode);
    linkNode.children.find(n => n.name === 'basic').children.find(n => n.name === `down_${linkState.walkingFrame > 2 ? 1 : 0}`).visible = true;
    const newX = linkNode.x;
    const newY = linkNode.y + velocity;
    if (isColliding(newX, newY)) {
        return;
    }
    linkNode.x = newX;
    linkNode.y = newY;
}
function loadWalls() {
    const walls = {};
    worldNode.children.forEach((node) => {
        if (node.name === 'tree' || node.name.includes('rock')) {
            if (!walls[node.x]) {
                walls[node.x] = {};
            }
            walls[node.x][node.y] = true;
        }
    });
    return walls;
}
if (main()) {
    setInterval(nextFrame, 1000 / FPS);
}


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLG1CQUFtQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBGQUEwRixtQ0FBbUM7QUFDN0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3RkFBd0YsbUNBQW1DO0FBQzNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkZBQTJGLG1DQUFtQztBQUM5SDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBGQUEwRixtQ0FBbUM7QUFDN0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9jb2RlLnRzXCIpO1xuIiwiLy8gVGhpcyBwbHVnaW4gd2lsbCBvcGVuIGEgbW9kYWwgdG8gcHJvbXB0IHRoZSB1c2VyIHRvIGVudGVyIGEgbnVtYmVyLCBhbmRcbi8vIGl0IHdpbGwgdGhlbiBjcmVhdGUgdGhhdCBtYW55IHJlY3RhbmdsZXMgb24gdGhlIHNjcmVlbi5cbi8vIFRoaXMgZmlsZSBob2xkcyB0aGUgbWFpbiBjb2RlIGZvciB0aGUgcGx1Z2lucy4gSXQgaGFzIGFjY2VzcyB0byB0aGUgKmRvY3VtZW50Ki5cbi8vIFlvdSBjYW4gYWNjZXNzIGJyb3dzZXIgQVBJcyBpbiB0aGUgPHNjcmlwdD4gdGFnIGluc2lkZSBcInVpLmh0bWxcIiB3aGljaCBoYXMgYVxuLy8gZnVsbCBicm93c2VyIGVudmlyb21lbnQgKHNlZSBkb2N1bWVudGF0aW9uKS5cbi8vIFRoaXMgc2hvd3MgdGhlIEhUTUwgcGFnZSBpbiBcInVpLmh0bWxcIi5cbmxldCBsaW5rTm9kZSA9IG51bGw7XG5sZXQgd29ybGROb2RlO1xubGV0IHdhbGxzID0ge307XG5mdW5jdGlvbiBtYWluKCkge1xuICAgIGlmICghZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uKSB7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKFwiUGxlYXNlIGhhdmUgTGluayBzZWxlY3RlZCB3aGlsZSBydW5uaW5nIHRoZSBQbHVnaW5cIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvblswXS50eXBlICE9PSAnSU5TVEFOQ0UnKSB7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKFwiU2VsZWN0ZWQgbm9kZSBtdXN0IGJlIGFuIGluc3RhbmNlLCB3aG9zZSBtYXN0ZXIgbGl2ZXMgaW4gJ3Nwcml0ZXMnIGZyYW1lXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxpbmtOb2RlID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uWzBdO1xuICAgIGlmIChsaW5rTm9kZS5wYXJlbnQudHlwZSAhPT0gJ0ZSQU1FJykge1xuICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbihcIldvcmxkIG11c3QgYmUgYSBmcmFtZVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB3b3JsZE5vZGUgPSBsaW5rTm9kZS5wYXJlbnQ7XG4gICAgd2FsbHMgPSBsb2FkV2FsbHMoKTtcbiAgICBjb25zb2xlLmxvZyh3YWxscyk7XG4gICAgcmV0dXJuIHRydWU7XG59XG5maWdtYS5zaG93VUkoX19odG1sX18pO1xuLy8gbGV0IGhlYWx0aCA9IGV2ZW50LmRhdGEucGx1Z2luTWVzc2FnZS5oZWFsdGhcbi8vIGxldCBuZXdIZWFsdGggPSAnJ1xuLy8gd2hpbGUgKGhlYWx0aCA+PSAxKSB7XG4vLyAgIG5ld0hlYWx0aCArPSAn8J+Slydcbi8vICAgaGVhbHRoIC09IDFcbi8vIH1cbi8vIHdoaWxlIChldmVudC5kYXRhLnBsdWdpbk1lc3NhZ2UuaGVhbHRoID49IC41KSB7XG4vLyAgIG5ld0hlYWx0aCArPSAn8J+SlCdcbi8vIH1cbi8vIG5ld2V2ZW50LmRhdGEucGx1Z2luTWVzc2FnZS5oZWFsdGhcbi8vICBldmVudC5kYXRhLnBsdWdpbk1lc3NhZ2UuaGVhbHRoLnJlXG5maWdtYS51aS5wb3N0TWVzc2FnZSh7IGhlYWx0aDogJ/Cfkpfwn5KX8J+SlycgfSk7XG5jb25zdCBGUFMgPSAzMDtcbmNvbnN0IGtleXNQcmVzc2VkID0ge1xuICAgIHVwOiBmYWxzZSwgZG93bjogZmFsc2UsIGxlZnQ6IGZhbHNlLCByaWdodDogZmFsc2UsIGFjdGlvbjogZmFsc2Vcbn07XG5jb25zdCBsaW5rU3RhdGUgPSB7XG4gICAgaGVhbHRoOiAzLFxuICAgIHdhbGtpbmdGcmFtZTogMCxcbn07XG5maWdtYS51aS5vbm1lc3NhZ2UgPSBtc2cgPT4ge1xuICAgIHN3aXRjaCAobXNnLmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSAxMzogLy8gRU5URVJcbiAgICAgICAgY2FzZSAxNjogLy8gU0hJRlRcbiAgICAgICAgY2FzZSAxNzogLy8gQ1RSTFxuICAgICAgICBjYXNlIDE4OiAvLyBBTFRcbiAgICAgICAgY2FzZSAzMjogLy8gU1BBQ0VcbiAgICAgICAgICAgIGtleXNQcmVzc2VkLmFjdGlvbiA9IChtc2cudHlwZSA9PT0gJ2tleWRvd24nKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM3OiAvLyBMRUZUX0FSUk9XXG4gICAgICAgIGNhc2UgNjU6IC8vIEFcbiAgICAgICAgICAgIGtleXNQcmVzc2VkLmxlZnQgPSAobXNnLnR5cGUgPT09ICdrZXlkb3duJykgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzODogLy8gVVBfQVJST1dcbiAgICAgICAgY2FzZSA4NzogLy8gV1xuICAgICAgICAgICAga2V5c1ByZXNzZWQudXAgPSAobXNnLnR5cGUgPT09ICdrZXlkb3duJykgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOTogLy8gUklHSFRfQVJST1dcbiAgICAgICAgY2FzZSA2ODogLy8gRFxuICAgICAgICAgICAga2V5c1ByZXNzZWQucmlnaHQgPSAobXNnLnR5cGUgPT09ICdrZXlkb3duJykgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MDogLy8gRE9XTl9BUlJPV1xuICAgICAgICBjYXNlIDgzOiAvLyBTXG4gICAgICAgICAgICBrZXlzUHJlc3NlZC5kb3duID0gKG1zZy50eXBlID09PSAna2V5ZG93bicpID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vIENhbGwgdGhpcyB3aGVuIExpbmsgZGllc1xuICAgIC8vIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG59O1xuZnVuY3Rpb24gbmV4dEZyYW1lKCkge1xuICAgIGNvbnNvbGUubG9nKGxpbmtTdGF0ZSk7XG4gICAgbGV0IHdhbGtpbmcgPSBmYWxzZTtcbiAgICBpZiAoa2V5c1ByZXNzZWQuYWN0aW9uKSB7XG4gICAgICAgIGFjdGlvbigpO1xuICAgIH1cbiAgICBpZiAoa2V5c1ByZXNzZWQubGVmdCAmJiAha2V5c1ByZXNzZWQucmlnaHQpIHtcbiAgICAgICAgbW92ZUxlZnQoa2V5c1ByZXNzZWQudXAgPT09IGtleXNQcmVzc2VkLmRvd24gPyAzLjUgOiAyLjgpO1xuICAgICAgICB3YWxraW5nID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGtleXNQcmVzc2VkLnJpZ2h0ICYmICFrZXlzUHJlc3NlZC5sZWZ0KSB7XG4gICAgICAgIG1vdmVSaWdodChrZXlzUHJlc3NlZC51cCA9PT0ga2V5c1ByZXNzZWQuZG93biA/IDMuNSA6IDIuOCk7XG4gICAgICAgIHdhbGtpbmcgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoa2V5c1ByZXNzZWQudXAgJiYgIWtleXNQcmVzc2VkLmRvd24pIHtcbiAgICAgICAgbW92ZVVwKGtleXNQcmVzc2VkLmxlZnQgPT09IGtleXNQcmVzc2VkLnJpZ2h0ID8gMy41IDogMi44KTtcbiAgICAgICAgd2Fsa2luZyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChrZXlzUHJlc3NlZC5kb3duICYmICFrZXlzUHJlc3NlZC51cCkge1xuICAgICAgICBtb3ZlRG93bihrZXlzUHJlc3NlZC5sZWZ0ID09PSBrZXlzUHJlc3NlZC5yaWdodCA/IDMuNSA6IDIuOCk7XG4gICAgICAgIHdhbGtpbmcgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAod2Fsa2luZykge1xuICAgICAgICBpZiAobGlua1N0YXRlLndhbGtpbmdGcmFtZSA9PT0gNClcbiAgICAgICAgICAgIGxpbmtTdGF0ZS53YWxraW5nRnJhbWUgPSAwO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsaW5rU3RhdGUud2Fsa2luZ0ZyYW1lKys7XG4gICAgfVxufVxuZnVuY3Rpb24gYWN0aW9uKCkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiYWN0aW9uXCIpXG59XG5mdW5jdGlvbiBpc0NvbGxpZGluZyh4LCB5KSB7XG4gICAgdmFyIF9hLCBfYiwgX2MsIF9kO1xuICAgIGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID4gd29ybGROb2RlLndpZHRoIHx8IHkgPiB3b3JsZE5vZGUuaGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gKCgoX2EgPSB3YWxsc1tNYXRoLmZsb29yKHggLyAxNikgKiAxNl0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYVtNYXRoLmZsb29yKHkgLyAxNikgKiAxNl0pIHx8ICgoX2IgPSB3YWxsc1tNYXRoLmZsb29yKHggLyAxNikgKiAxNl0pID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYltNYXRoLmNlaWwoeSAvIDE2KSAqIDE2XSkgfHwgKChfYyA9IHdhbGxzW01hdGguY2VpbCh4IC8gMTYpICogMTZdKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2NbTWF0aC5mbG9vcih5IC8gMTYpICogMTZdKSB8fCAoKF9kID0gd2FsbHNbTWF0aC5jZWlsKHggLyAxNikgKiAxNl0pID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZFtNYXRoLmNlaWwoeSAvIDE2KSAqIDE2XSkpO1xufVxuZnVuY3Rpb24gc2V0QWxsQmFzaWNTcHJpdGVzSW52aXNpYmxlKGxpbmtOb2RlKSB7XG4gICAgbGlua05vZGUuY2hpbGRyZW4uZmluZChuID0+IG4ubmFtZSA9PT0gJ2Jhc2ljJykuY2hpbGRyZW4uZmluZChuID0+IG4ubmFtZSA9PT0gJ2xlZnRfMCcpLnZpc2libGUgPSBmYWxzZTtcbiAgICBsaW5rTm9kZS5jaGlsZHJlbi5maW5kKG4gPT4gbi5uYW1lID09PSAnYmFzaWMnKS5jaGlsZHJlbi5maW5kKG4gPT4gbi5uYW1lID09PSAncmlnaHRfMCcpLnZpc2libGUgPSBmYWxzZTtcbiAgICBsaW5rTm9kZS5jaGlsZHJlbi5maW5kKG4gPT4gbi5uYW1lID09PSAnYmFzaWMnKS5jaGlsZHJlbi5maW5kKG4gPT4gbi5uYW1lID09PSAnZG93bl8wJykudmlzaWJsZSA9IGZhbHNlO1xuICAgIGxpbmtOb2RlLmNoaWxkcmVuLmZpbmQobiA9PiBuLm5hbWUgPT09ICdiYXNpYycpLmNoaWxkcmVuLmZpbmQobiA9PiBuLm5hbWUgPT09ICd1cF8wJykudmlzaWJsZSA9IGZhbHNlO1xuICAgIGxpbmtOb2RlLmNoaWxkcmVuLmZpbmQobiA9PiBuLm5hbWUgPT09ICdiYXNpYycpLmNoaWxkcmVuLmZpbmQobiA9PiBuLm5hbWUgPT09ICdsZWZ0XzEnKS52aXNpYmxlID0gZmFsc2U7XG4gICAgbGlua05vZGUuY2hpbGRyZW4uZmluZChuID0+IG4ubmFtZSA9PT0gJ2Jhc2ljJykuY2hpbGRyZW4uZmluZChuID0+IG4ubmFtZSA9PT0gJ3JpZ2h0XzEnKS52aXNpYmxlID0gZmFsc2U7XG4gICAgbGlua05vZGUuY2hpbGRyZW4uZmluZChuID0+IG4ubmFtZSA9PT0gJ2Jhc2ljJykuY2hpbGRyZW4uZmluZChuID0+IG4ubmFtZSA9PT0gJ2Rvd25fMScpLnZpc2libGUgPSBmYWxzZTtcbiAgICBsaW5rTm9kZS5jaGlsZHJlbi5maW5kKG4gPT4gbi5uYW1lID09PSAnYmFzaWMnKS5jaGlsZHJlbi5maW5kKG4gPT4gbi5uYW1lID09PSAndXBfMScpLnZpc2libGUgPSBmYWxzZTtcbn1cbmZ1bmN0aW9uIG1vdmVMZWZ0KHZlbG9jaXR5KSB7XG4gICAgc2V0QWxsQmFzaWNTcHJpdGVzSW52aXNpYmxlKGxpbmtOb2RlKTtcbiAgICBsaW5rTm9kZS5jaGlsZHJlbi5maW5kKG4gPT4gbi5uYW1lID09PSAnYmFzaWMnKS5jaGlsZHJlbi5maW5kKG4gPT4gbi5uYW1lID09PSBgbGVmdF8ke2xpbmtTdGF0ZS53YWxraW5nRnJhbWUgPiAyID8gMSA6IDB9YCkudmlzaWJsZSA9IHRydWU7XG4gICAgY29uc3QgbmV3WCA9IGxpbmtOb2RlLnggLSB2ZWxvY2l0eTtcbiAgICBjb25zdCBuZXdZID0gbGlua05vZGUueTtcbiAgICBpZiAoaXNDb2xsaWRpbmcobmV3WCwgbmV3WSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsaW5rTm9kZS54ID0gbmV3WDtcbiAgICBsaW5rTm9kZS55ID0gbmV3WTtcbn1cbmZ1bmN0aW9uIG1vdmVVcCh2ZWxvY2l0eSkge1xuICAgIHNldEFsbEJhc2ljU3ByaXRlc0ludmlzaWJsZShsaW5rTm9kZSk7XG4gICAgbGlua05vZGUuY2hpbGRyZW4uZmluZChuID0+IG4ubmFtZSA9PT0gJ2Jhc2ljJykuY2hpbGRyZW4uZmluZChuID0+IG4ubmFtZSA9PT0gYHVwXyR7bGlua1N0YXRlLndhbGtpbmdGcmFtZSA+IDIgPyAxIDogMH1gKS52aXNpYmxlID0gdHJ1ZTtcbiAgICBjb25zdCBuZXdYID0gbGlua05vZGUueDtcbiAgICBjb25zdCBuZXdZID0gbGlua05vZGUueSAtIHZlbG9jaXR5O1xuICAgIGlmIChpc0NvbGxpZGluZyhuZXdYLCBuZXdZKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxpbmtOb2RlLnggPSBuZXdYO1xuICAgIGxpbmtOb2RlLnkgPSBuZXdZO1xufVxuZnVuY3Rpb24gbW92ZVJpZ2h0KHZlbG9jaXR5KSB7XG4gICAgc2V0QWxsQmFzaWNTcHJpdGVzSW52aXNpYmxlKGxpbmtOb2RlKTtcbiAgICBsaW5rTm9kZS5jaGlsZHJlbi5maW5kKG4gPT4gbi5uYW1lID09PSAnYmFzaWMnKS5jaGlsZHJlbi5maW5kKG4gPT4gbi5uYW1lID09PSBgcmlnaHRfJHtsaW5rU3RhdGUud2Fsa2luZ0ZyYW1lID4gMiA/IDEgOiAwfWApLnZpc2libGUgPSB0cnVlO1xuICAgIGNvbnN0IG5ld1ggPSBsaW5rTm9kZS54ICsgdmVsb2NpdHk7XG4gICAgY29uc3QgbmV3WSA9IGxpbmtOb2RlLnk7XG4gICAgaWYgKGlzQ29sbGlkaW5nKG5ld1gsIG5ld1kpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGlua05vZGUueCA9IG5ld1g7XG4gICAgbGlua05vZGUueSA9IG5ld1k7XG59XG5mdW5jdGlvbiBtb3ZlRG93bih2ZWxvY2l0eSkge1xuICAgIHNldEFsbEJhc2ljU3ByaXRlc0ludmlzaWJsZShsaW5rTm9kZSk7XG4gICAgbGlua05vZGUuY2hpbGRyZW4uZmluZChuID0+IG4ubmFtZSA9PT0gJ2Jhc2ljJykuY2hpbGRyZW4uZmluZChuID0+IG4ubmFtZSA9PT0gYGRvd25fJHtsaW5rU3RhdGUud2Fsa2luZ0ZyYW1lID4gMiA/IDEgOiAwfWApLnZpc2libGUgPSB0cnVlO1xuICAgIGNvbnN0IG5ld1ggPSBsaW5rTm9kZS54O1xuICAgIGNvbnN0IG5ld1kgPSBsaW5rTm9kZS55ICsgdmVsb2NpdHk7XG4gICAgaWYgKGlzQ29sbGlkaW5nKG5ld1gsIG5ld1kpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGlua05vZGUueCA9IG5ld1g7XG4gICAgbGlua05vZGUueSA9IG5ld1k7XG59XG5mdW5jdGlvbiBsb2FkV2FsbHMoKSB7XG4gICAgY29uc3Qgd2FsbHMgPSB7fTtcbiAgICB3b3JsZE5vZGUuY2hpbGRyZW4uZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICBpZiAobm9kZS5uYW1lID09PSAndHJlZScgfHwgbm9kZS5uYW1lLmluY2x1ZGVzKCdyb2NrJykpIHtcbiAgICAgICAgICAgIGlmICghd2FsbHNbbm9kZS54XSkge1xuICAgICAgICAgICAgICAgIHdhbGxzW25vZGUueF0gPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdhbGxzW25vZGUueF1bbm9kZS55XSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gd2FsbHM7XG59XG5pZiAobWFpbigpKSB7XG4gICAgc2V0SW50ZXJ2YWwobmV4dEZyYW1lLCAxMDAwIC8gRlBTKTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=