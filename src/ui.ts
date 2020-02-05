import './ui.css'

document.getElementById('controls').focus()
document.getElementById('controls').onkeydown = (e) => {
  parent.postMessage({ pluginMessage: { type: 'keydown', keyCode: e.keyCode } }, '*')
}
document.getElementById('controls').onkeyup = (e) => {
  parent.postMessage({ pluginMessage: { type: 'keyup', keyCode: e.keyCode } }, '*')
}


// window.addEventListener("gamepadconnected", function(e) {
//   console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
//     e.gamepad.index, e.gamepad.id,
//     e.gamepad.buttons.length, e.gamepad.axes.length);
// });

onmessage = (event) => {
  if (event.data.pluginMessage.health) {
    document.getElementById('health').innerText = event.data.pluginMessage.health
  }
}