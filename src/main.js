import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;

var visibility = true

document.addEventListener('visibilitychange', () => {
	console.log(visibility)
  if ((document.hidden || document.msHidden || document.webkitHidden) && visibility) {
    // the page has been hidden
    visibility = false
		alert(`Másik tabon gugliztál? ${visibility}`)
    visibility = true
  } else {
    // the page has become visible
    //alert('Jó, hogy visszajöttél!')
  }
});

window.addEventListener('onblur', () => {
  // the page has been hidden
	alert('Majdnem elhagytál?')
});

// BEFOREUNLOAD
function initializeReloadCount() {
  window.addEventListener("beforeunload", beforeUnloadHandler)
}
function beforeUnloadHandler() {
  localStorage.setItem("lastUnloadAt", Math.floor(Date.now() / 1000))
  window.removeEventListener("beforeunload", beforeUnloadHandler);
}
let reloadCount = null
function checkReload() {
  if (localStorage.getItem("reloadCount")) {
    reloadCount = parseInt(localStorage.getItem("reloadCount"))
  } else {
    reloadCount = 0
    localStorage.setItem("reloadCount", reloadCount)
  }
  if (
    Math.floor(Date.now() / 1000) - localStorage.getItem("lastUnloadAt") < 5
  ) {
    onReloadDetected()
  } else {
    reloadCount = 0;
    localStorage.setItem("reloadCount", reloadCount)
  }
  function onReloadDetected() {
    reloadCount = reloadCount + 1
    localStorage.setItem("reloadCount", reloadCount)
    if (reloadCount === 1) {
      alert('Semmi sem változott!')
    }
  }

}

