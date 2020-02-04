import './ui.css';
document.getElementById('controls').focus();
document.getElementById('controls').onkeydown = (e) => {
    parent.postMessage({ pluginMessage: { type: 'keydown', keyCode: e.keyCode } }, '*');
};
document.getElementById('controls').onkeyup = (e) => {
    parent.postMessage({ pluginMessage: { type: 'keyup', keyCode: e.keyCode } }, '*');
};
onmessage = (event) => {
    if (event.data.pluginMessage.health) {
        document.getElementById('health').innerText = event.data.pluginMessage.health;
    }
};
