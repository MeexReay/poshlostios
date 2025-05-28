eval(readFile("/app/zcom.js"))

const headerHeight = 24;

async function drawScreen(ctx) {
    ctx.fillStyle = "darkcyan"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    // ctx.fillStyle = "cyan";
    // ctx.font = "bold 14px comic-sans";
    // ctx.textBaseline = "middle";
    // ctx.textAlign = "left";
    // ctx.fillText(`Alt+Shift+Q - выключить оконный менеджер | Alt+Enter - включить zterm | Alt+Shift+C - закрыть окно`, 10, 16);

    for (const win of window.mxwm_windows) {
        if (win.decorated) {
            drawWindowDecorations(
                ctx,
                win.wid == selected_window,
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
    executeCommand(["/app/poki.js"])    
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
    return pressedKeys.indexOf(key) !== -1
}

async function onKeyDown(ctx, key) {
    if (pressedKeys.indexOf(key) === -1) {
        pressedKeys.push(key)
    }
    
    if ((isPressed("Alt") || isPressed("Meta")) && isPressed("Shift") && isPressed("Q")) {
        disableGraphics()
        return
    }
    
    let to_close = getWindow(selected_window)
    if (to_close != null && to_close.closable &&
        (isPressed("Alt") || isPressed("Meta")) &&
        isPressed("Shift") &&
        isPressed("C")) {
        signalWindow(selected_window, 9)
        closeWindow(selected_window)
        return
    }

    if ((isPressed("Alt") || isPressed("Meta")) && pressedKeys.indexOf("Enter") !== -1) {
        executeCommand(["/app/zterm.js"])
        return
    }

    if (selected_window != null) getWindow(selected_window).onkeydown(key)
}

async function onKeyUp(ctx, key) {
    let index = pressedKeys.indexOf(key)
    if (index !== -1) {
        pressedKeys.splice(index, 1)
    }
    
    if (selected_window != null) getWindow(selected_window).onkeyup(key)
}

let dragging_window = null
let resizing_window = null
let selected_window = null

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
    
    for (let window of listWindows()) {
        if (isMouseOnHeader(window) ||
            ((selected_window == window.wid || isMouseInside(window))
                && isPressed("Alt") && button == 0)) {
            if (window.movable) {
                setGraphicsCursor("grabbing")
                last_cursor = true
                dragging_window = window["wid"]
            }
            if (window.selectable) {
                selected_window = window["wid"]
                moveWindowToTop(window.wid)
            }
            break
        }
        if (isMouseOnCorner(window) ||
            ((selected_window == window.wid || isMouseInside(window))
                && isPressed("Alt") && button == 2)) {
            if (window.resizable) {
                resizing_window = window["wid"]
                setGraphicsCursor("nwse-resize")
                last_cursor = true
            }
            if (window.selectable) {
                moveWindowToTop(window.wid)
                selected_window = window["wid"]
            }
            break
        }
        if (isMouseInside(window)) {
            if (window.selectable) {
                selected_window = window["wid"]
                moveWindowToTop(window.wid)
            }
            window.onmousedown(button)
            break
        }
    }
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
    
    for (let window of listWindows()) {
        if (isMouseInside(window)) {
            window.onmouseup(button)
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

    for (let window of listWindows()) {
        if (isMouseInside(window)) {
            window.onmousemove(mouse_position[0] - window.x, mouse_position[1] - window.y)
        }
        if (dragging_window == null && window.movable && isMouseOnHeader(window)) {
            cursor = "grab"
        }
        if (window.resizable && isMouseOnCorner(window)) {
            cursor = "nwse-resize"
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
            selected_window = window["wid"]
        }
    }

    if (selected_window != null) {
        let window = getWindow(selected_window)
        window.onmousewheel(y,x,z)
    }
}

async function main(args) {
    let ctx = null
    
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
    
    return 0
}
