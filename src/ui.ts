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
  parent.postMessage({ pluginMessage: { type: 'focus' } }, '*')
}
uiEl.onblur = (e) => {
  parent.postMessage({ pluginMessage: { type: 'blur' } }, '*')
}

// window.addEventListener("gamepadconnected", function(e) {
//   console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
//     e.gamepad.index, e.gamepad.id,
//     e.gamepad.buttons.length, e.gamepad.axes.length)
// })

onmessage = (event) => {
  if (event.data.pluginMessage.health) {
    document.getElementById('health')!.innerHTML = event.data.pluginMessage.health
  } else if (event.data.pluginMessage.triforceShards) {
    document.getElementById('triforce-shards')!.innerHTML = event.data.pluginMessage.triforceShards
  } else if (event.data.pluginMessage.setSword) {
    document.getElementById('sword')!.className = `${event.data.pluginMessage.setSword} visible`
  } else if (event.data.pluginMessage.setBow) {
    document.getElementById('bow')!.className = `${event.data.pluginMessage.setBow} visible`
  } else if (event.data.pluginMessage.message) {
    document.getElementById("message")!.innerText = event.data.pluginMessage.message
  }
}