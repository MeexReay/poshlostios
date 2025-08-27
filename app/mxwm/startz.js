eval(readFile("/app/zcom.js"))

const headerHeight = 24;

let background = new Image()

async function drawScreen(ctx) {
    if (config.background.includes(":")) {
        background.src = config.background
        var pattern = ctx.createPattern(background, "repeat");
        ctx.fillStyle = pattern
    } else {
        ctx.fillStyle = config.background
    }
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    for (const win of window.mxwm_windows) {
        if (win.decorated) {
            drawWindowDecorations(
                ctx,
                win.wid == getSelected(),
                win.x,
                win.y,
                win.width,
                win.height,
                win.title
            )
        }
        
        ctx.drawImage(win.canvas, win.x, win.y);
    }
}

async function drawWindowDecorations(ctx, is_selected, x, y, width, height, title) {
    const borderWidth = 2;

    const outerX = x - borderWidth;
    const outerY = y - headerHeight - borderWidth;
    const outerWidth = width + borderWidth * 2;
    const outerHeight = height + headerHeight + borderWidth * 2;

    const titleX = outerX + 10
    const titleY = outerY + 14

    ctx.fillStyle = is_selected ? "#f4f4f4" : "#a3d4a3";
    ctx.fillRect(outerX, outerY, outerWidth, outerHeight)

    ctx.fillStyle = "#222";
    ctx.font = "bold 14px terminus";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(title, titleX, titleY);
}

async function onStart(screen_ctx) {
    for (let command of config.startup_commands) {
        executeCommand(command, terminal)
    }
}

function moveWindowToTop(wid) {
    let my_win
    let windows = []
    for (let win of window.mxwm_windows) {
        if (win.wid == wid) {
            my_win = win
            continue
        }
        windows.push(win)
    }
    windows.push(my_win)
    window.mxwm_windows = windows
}

let pressedKeys = []
let pressedButtons = [false, false, false]

function isPressed(key) {
    return pressedKeys.indexOf(key.toUpperCase()) !== -1
}

async function onKeyDown(ctx, key) {
    if (pressedKeys.indexOf(key.toUpperCase()) === -1) {
        pressedKeys.push(key.toUpperCase())
    }
    
    if ((isPressed("Alt") || isPressed("Meta")) && isPressed("Shift") && isPressed("Q")) {
        disableGraphics()
        return
    }
    
    if ((isPressed("Alt") || isPressed("Meta"))
        && isPressed("Shift") && isPressed("R")) {
        disableGraphics()
        restarting = true
        return
    }
    
    let to_close = getWindow(getSelected())
    if (to_close != null && to_close.closable &&
        (isPressed("Alt") || isPressed("Meta")) &&
        isPressed("Shift") &&
        isPressed("C")) {
        signalWindow(getSelected(), 9)
        closeWindow(getSelected())
        let list_windows = listWindows()
        if (list_windows.length > 0) {
            let last_window = list_windows[list_windows.length - 1]
            if (last_window.selectable) {
                setSelected(last_window.wid)
            }
        }
        return
    }

    if ((isPressed("Alt") || isPressed("Meta")) && isPressed("Enter")) {
        executeCommand(["/app/zterm.js"], terminal)
        return
    }

    let selected = getWindow(getSelected())
    if (selected != null) selected.onkeydown(key)
}

async function onKeyUp(ctx, key) {
    let index = pressedKeys.indexOf(key.toUpperCase())
    if (index !== -1) {
        pressedKeys.splice(index, 1)
    }
    
    let selected = getWindow(getSelected())
    if (selected != null) selected.onkeyup(key)
}

let dragging_window = null
let resizing_window = null

function isMouseOnHeader(window) {
    return window.x < mouse_position[0] && mouse_position[0] < window.x + window.width &&
           window.y - headerHeight < mouse_position[1] && mouse_position[1] < window.y
}

function isMouseInside(window) {
    return mouse_position[0] >= window.x &&
           mouse_position[1] >= window.y &&
           mouse_position[0] <= window.x + window.width &&
           mouse_position[1] <= window.y + window.height
}

function isMouseOnCorner(window) {
    return window.x + window.width - 15 < mouse_position[0] &&
           window.x + window.width + 15 > mouse_position[0] &&
           window.y + window.height - 15 < mouse_position[1] &&
           window.y + window.height + 15 > mouse_position[1]
}

async function onMouseDown(ctx, button) {
    if (button >= 0 && button <= 2) {
        pressedButtons[button] = true
    }

    let iter = window => {
        if (window == null) return
        if (isMouseOnHeader(window) ||
            ((getSelected() == window.wid || isMouseInside(window))
                && isPressed("Alt") && button == 0)) {
            if (window.movable) {
                setGraphicsCursor("grabbing")
                last_cursor = true
                dragging_window = window["wid"]
            }
            if (window.selectable) {
                setSelected(window["wid"])
                moveWindowToTop(window.wid)
            }
            return true
        }
        if (isMouseOnCorner(window) ||
            ((getSelected() == window.wid || isMouseInside(window)) &&
            isPressed("Alt") &&
            button == 2)) {
            if (window.resizable) {
                resizing_window = window["wid"]
                setGraphicsCursor("nwse-resize")
                last_cursor = true
            }
            if (window.selectable) {
                moveWindowToTop(window.wid)
                setSelected(window["wid"])
            }
            return true
        }
        if (isMouseInside(window)) {
            if (window.selectable) {
                setSelected(window["wid"])
                moveWindowToTop(window.wid)
            }
            window.onmousedown(button)
            return true
        }
        return false
    }

    if (iter(getWindow(getSelected()))) return
    
    for (let window of listWindows().toReversed()) {
        if (window.wid == getSelected()) continue
        if (iter(window)) return
    }

    setSelected(null)
}

async function onMouseUp(ctx, button) {
    if (button >= 0 && button <= 2) {
        pressedButtons[button] = false
    }

    if (dragging_window != null) {
        if (isMouseOnHeader(getWindow(dragging_window))) {
            setGraphicsCursor("grab")
            last_cursor = true
        }
        dragging_window = null
    }

    if (resizing_window != null) {
        resizing_window = null
    }

    let iter = (window) => {
        if (window == null) return false
        if (isMouseInside(window)) {
            window.onmouseup(button)
            return true
        }
        return false
    }

    if (iter(getWindow(getSelected()))) return
    for (let window of listWindows().toReversed()) {
        if (window.wid == getSelected()) continue
        if (iter(window)) {
            return
        }
    }
}

let mouse_position = [0, 0]
let last_cursor = false

async function onMouseMove(ctx, x, y) {
    let cursor = "default"
    
    if (dragging_window != null) { 
        let window = getWindow(dragging_window)
        moveWindow(
            dragging_window,
            Math.min(Math.max(window.x + (x - mouse_position[0]), 0), ctx.canvas.width),
            Math.min(Math.max(window.y + (y - mouse_position[1]), headerHeight), ctx.canvas.height - headerHeight),
            window.width,
            window.height
        )
        cursor = "grabbing"
    }

    if (resizing_window != null) {
        let window = getWindow(resizing_window)
        moveWindow(
            resizing_window,
            window.x,
            window.y,
            Math.max(window.width + (x - mouse_position[0]), 0),
            Math.max(window.height + (y - mouse_position[1]), 0)
        )
        cursor = "nwse-resize"
    }
    
    mouse_position = [x, y]

    let iter = (window) => {
        if (window == null) return false
        if (isMouseInside(window)) {
            let res = window.onmousemove(mouse_position[0] - window.x, mouse_position[1] - window.y)
            if (res != null) {
                cursor = res
            }
            return true
        }
        if (dragging_window == null && window.movable && isMouseOnHeader(window)) {
            cursor = "grab"
            return true
        }
        if (window.resizable && isMouseOnCorner(window)) {
            cursor = "nwse-resize"
            return true
        }
        return false
    }

    if (!iter(getWindow(getSelected()))) {
        for (let window of listWindows().toReversed()) {
            if (window.wid == getSelected()) continue
            if (iter(window)) {
                break
            }
        }
    }

    if (cursor != "default") {
        last_cursor = true
        setGraphicsCursor(cursor)
    } else if (last_cursor) {
        last_cursor = false
        setGraphicsCursor(cursor)
    }
}

async function onMouseWheel(ctx, x, y, z) {
    for (let window of listWindows()) {
        if (isMouseInside(window)) {
            setSelected(window["wid"])
        }
    }

    if (getSelected() != null) {
        let window = getWindow(getSelected())
        window.onmousewheel(y,x,z)
    }
}

let config = null
let restarting = false

async function main(args) {
    let ctx = null

    config = JSON.parse(readFile("/config/mxwm.json"))
    
    enableGraphics({
        "onmousemove": (x, y) => onMouseMove(ctx, x, y),
        "onmousewheel": (x, y, z) => onMouseWheel(ctx, x, y, z),
        "onmousedown": (btn) => onMouseDown(ctx, btn),
        "onmouseup": (btn) => onMouseUp(ctx, btn),
        "onkeydown": (key) => onKeyDown(ctx, key),
        "onkeyup": (key) => onKeyUp(ctx, key),
        "onresize": () => {
            for (let window of listWindows()) {
                window.onupdate()
            }
        }
    })

    window.mxwm_windows = []
    window.mxwm_selected = null

    ctx = getGraphics()

    await onStart()

    let drawLoop = () => {
        if (graphics_canvas != null) {
            drawScreen(ctx)
            requestAnimationFrame(drawLoop)
        }
    }

    drawLoop()

    while (graphics_canvas != null) {
        await new Promise(res => setTimeout(res, 1000))
    }

    if (restarting) {
        await executeCommand(["/app/startz.js"], terminal)
    }
    
    return 0
}
