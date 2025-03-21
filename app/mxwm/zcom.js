function hasGraphicsImplementation() {
  return true
}

/** returns wid and context */
function createWindow(options) {
  let canvas = document.createElement("canvas")

  let win = {
    "title": options["title"],
    "x": options["x"] || 0,
    "y": options["y"] || 0,
    "width": options["width"] || options["w"] || 200,
    "height": options["height"] || options["h"] || 200,
    "wid": Date.now().toString() + Math.round(Math.random() * 100).toString(),
    "on_signal": options["on_signal"] || options["callback"] || (o => {})
  }

  canvas.width = win["width"].toString()
  canvas.height = win["height"].toString()

  let context = canvas.getContext("2d")

  win["canvas"] = canvas
  win["context"] = context

  if ("mxwm_windows" in window) {
    window.mxwm_windows.push(win)
  } else {
    window.mxwm_windows = [ win ]
  }
}

function moveWindow(wid, x, y, w, h) {
  if (!("mxwm_windows" in window)) {
    window.mxwm_windows = [ ]
  }

  for (const win of window.mxwm_windows) {
    if (win["wid"] == wid) {
      win.x = x
      win.y = y
      win.width = w
      win.height = h
    }
  }
}

function signalWindow(wid, signal) {
  if (!("mxwm_windows" in window)) {
    window.mxwm_windows = [ ]
  }

  for (const win of window.mxwm_windows) {
    if (win["wid"] == wid) {
      win.on_signal(signal)
    }
  }
}

function closeWindow(wid) {
  if (!("mxwm_windows" in window)) {
    window.mxwm_windows = [ ]
  }

  window.mxwm_windows = window.mxwm_windows.filter(o => o.wid != wid)
}

function getWindow(wid) {
  if (!("mxwm_windows" in window)) {
    window.mxwm_windows = [ ]
  }

  for (const win of window.mxwm_windows) {
    if (win["wid"] == wid) {
      return win
    }
  }
  return null
}

function listWindows() {
  if (!("mxwm_windows" in window)) {
    window.mxwm_windows = [ ]
  }

  return window.mxwm_windows
}