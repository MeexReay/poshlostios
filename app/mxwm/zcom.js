function hasGraphicsImplementation() {
  return true
}

/** returns wid and context */
function createWindow(options) {
  console.log("create", options)
  
  let canvas = document.createElement("canvas")

  let wid = Date.now().toString() + Math.round(Math.random() * 100).toString()

  let win = {
    "title": options["title"],
    "x": options["x"] || 0,
    "y": options["y"] || 0,
    "width": options["width"] || options["w"] || 200,
    "height": options["height"] || options["h"] || 200,
    "app_id": options["app_id"] || options["title"],
    "wid": wid,
    "onsignal": options["onsignal"] || (o => {}),
    "onkeydown": options["onkeydown"] || (o => {}),
    "onkeyup": options["onkeyup"] || (o => {}),
    "onmousedown": options["onmousedown"] || (o => {}),
    "onmouseup": options["onmouseup"] || (o => {}),
    "onmousemove": options["onmousemove"] || ((x,y) => {}),
    "onresize": options["onresize"] || ((x,y) => {}),
    "onmousewheel": options["onmousewheel"] || options["onwheel"] || options["onscroll"] || ((y,x,z) => {}),
    "onupdate": options["onupdate"] || (() => {}),
    "decorated": "decorated" in options ? options["decorated"] : true,
    "selectable": "selectable" in options ? options["selectable"] : true,
    "closable": "closable" in options ? options["closable"] : true,
    "movable": "movable" in options ? options["movable"] : true,
    "resizable": "resizable" in options ? options["resizable"] : true,
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

  return [wid, context]
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
      win.canvas.width = w
      win.canvas.height = h
      win.onresize(w, h)
      break
    }
  }
}

function signalWindow(wid, signal) {
  if (!("mxwm_windows" in window)) {
    window.mxwm_windows = [ ]
  }

  for (const win of window.mxwm_windows) {
    if (win["wid"] == wid) {
      win.onsignal(signal)
    }
  }
}

function closeWindow(wid) {
  console.log("remove", wid)
  
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
