import './ui.css'

const uiEl = document.getElementById('ui')!
uiEl.focus()
uiEl.onkeydown = (e) => {
  parent.postMessage({ pluginMessage: { type: 'keydown', keyCode: e.keyCode } }, '*')
}
uiEl.onkeyup = (e) => {
  parent.postMessage({ pluginMessage: { type: 'keyup', keyCode: e.keyCode } }, '*')
}
uiEl.onfocus = (e) => {
  parent.postMessage({ pluginMessage: { type: 'resume' } }, '*')
}
uiEl.onblur = (e) => {
  parent.postMessage({ pluginMessage: { type: 'pause' } }, '*')
}


// window.addEventListener("gamepadconnected", function(e) {
//   console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
//     e.gamepad.index, e.gamepad.id,
//     e.gamepad.buttons.length, e.gamepad.axes.length)
// })

onmessage = (event) => {
  if (event.data.pluginMessage.health) {
    document.getElementById('health')!.innerHTML = event.data.pluginMessage.health
  } else if (event.data.pluginMessage.addItem) {
    document.getElementById(event.data.pluginMessage.addItem)!.className = 'visible'
  } else if (event.data.pluginMessage.fps) {
    document.getElementById("fps")!.innerText = event.data.pluginMessage.fps
  }
}