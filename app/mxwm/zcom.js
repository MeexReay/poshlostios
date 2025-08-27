function hasGraphicsImplementation() {
  return true
}

function getSelected() {
  return window.mxwm_selected
}

function setSelected(wid) {
  window.mxwm_selected = wid
}

/** returns wid and context */
function createWindow(options) {
  console.log("create", options)
  
  let canvas = document.createElement("canvas")

  let wid = Date.now().toString() + Math.round(Math.random() * 100).toString()

  let win = {
    "title": options["title"],
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
    "min_width": options["min_width"] || options["minwidth"] || 0,
    "max_width": options["max_width"] || options["maxwidth"] || 999999999999,
    "min_height": options["min_height"] || options["minheight"] || 0,
    "max_height": options["max_height"] || options["maxheight"] || 999999999999,
  }

  if (!("x" in options) && !("y" in options)) {
    let selected = getWindow(getSelected())
    console.log(selected)
    if (selected != null) {
      win.x = selected.x + 20
      win.y = selected.y + 20
    } else {
      win.x = 20
      win.y = 20
    }
  } else {
    win.x = options.x
    win.y = options.y
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

  if (win.selectable) {
    setSelected(wid)
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
      let rw = Math.min(Math.max(w, win.min_width), win.max_width)
      let rh = Math.min(Math.max(h, win.min_height), win.max_height)
      win.width = rw
      win.height = rh
      win.canvas.width = rw
      win.canvas.height = rh
      win.onresize(rw, rh)
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
