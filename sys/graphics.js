var graphics_canvas = null
var graphics_context = null


function enableGraphics() {
    graphics_canvas = document.createElement("canvas")
    graphics_canvas.id = "graphics"
    graphics_canvas.width = window.innerWidth.toString()
    graphics_canvas.height = window.innerHeight.toString()
    graphics_context = graphics_canvas.getContext("2d")
    graphics_context.fillStyle = "blue";
    graphics_context.fillRect(0, 0, graphics_canvas.width, graphics_canvas.height);
    document.body.appendChild(graphics_canvas)
}

function getGraphics() {
    return graphics_context
}

function disableGraphics() {
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