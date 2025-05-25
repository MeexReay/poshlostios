var graphics_canvas = null
var graphics_context = null

function setGraphicsCursor(name) {
    if (graphics_canvas != null) {
        graphics_canvas.style.cursor = name
    }
}

function enableGraphics(options={}) {
    document.body.style.overflow = "hidden"
    graphics_canvas = document.createElement("canvas")
    graphics_canvas.id = "graphics"
    graphics_canvas.width = window.innerWidth.toString()
    graphics_canvas.height = window.innerHeight.toString()
    graphics_canvas.setAttribute("tabindex", "0")

    graphics_canvas.addEventListener('contextmenu', event => {
        event.preventDefault()
    })

    if ("onmousewheel" in options) {
        graphics_canvas.onwheel = e => {
            options.onmousewheel(e.deltaX, e.deltaY, e.deltaZ)
            if (e.ctrlKey == true) {
                e.preventDefault();
            }
        }
    }

    if ("onmousemove" in options) {
        graphics_canvas.onmousemove = e => {
            options.onmousemove(e.x, e.y)
        }
    }

    if ("onmousedown" in options) {
        graphics_canvas.onmousedown = e => {
            options.onmousedown(e.button)
        }
    }

    if ("onmouseup" in options) {
        graphics_canvas.onmouseup = e => {
            options.onmouseup(e.button)
        }
    }

    if ("onkeydown" in options) {
        graphics_canvas.onkeydown = e => {
            options.onkeydown(e.key)
        }
    }

    if ("onkeyup" in options) {
        graphics_canvas.onkeyup = e => {
            options.onkeyup(e.key)
        }
    }

    graphics_context = graphics_canvas.getContext("2d")
    graphics_context.fillStyle = "black";
    graphics_context.fillRect(0, 0, graphics_canvas.width, graphics_canvas.height);

    window.addEventListener("resize", (event) => {
        graphics_canvas.width = window.innerWidth.toString()
        graphics_canvas.height = window.innerHeight.toString()
        if ("onresize" in options) {
            options.onresize()
        }
    })
    
    document.body.appendChild(graphics_canvas)

    graphics_canvas.focus()
}

function getGraphics() {
    return graphics_context
}

function disableGraphics() {
    document.body.style.overflow = null
    graphics_canvas.remove()
    graphics_canvas = null
    graphics_context = null
}

function hasGraphicsImplementation() {
    return false
}

/** returns wid and context */
function createWindow(options) {
    writeStdout("НА ВАШЕМ устройстве не найдена ни одна имплементация ZCOM. Установите чонить такое, по типу mxwm да есть же броу\n")
    throw new Error("There is no zcom implementation");
}

function moveWindow(wid, x, y, w, h) {
    writeStdout("НА ВАШЕМ устройстве не найдена ни одна имплементация ZCOM. Установите чонить такое, по типу mxwm да есть же броу\n")
    throw new Error("There is no zcom implementation")
}

function signalWindow(wid, signal) {
    writeStdout("НА ВАШЕМ устройстве не найдена ни одна имплементация ZCOM. Установите чонить такое, по типу mxwm да есть же броу\n")
    throw new Error("There is no zcom implementation")
}

function closeWindow(wid) {
    writeStdout("НА ВАШЕМ устройстве не найдена ни одна имплементация ZCOM. Установите чонить такое, по типу mxwm да есть же броу\n")
    throw new Error("There is no zcom implementation")
}

function getWindow(wid) {
    writeStdout("НА ВАШЕМ устройстве не найдена ни одна имплементация ZCOM. Установите чонить такое, по типу mxwm да есть же броу\n")
    throw new Error("There is no zcom implementation")
}

function listWindows() {
    writeStdout("НА ВАШЕМ устройстве не найдена ни одна имплементация ZCOM. Установите чонить такое, по типу mxwm да есть же броу\n")
    throw new Error("There is no zcom implementation")
}
