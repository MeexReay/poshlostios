eval(readFile("/app/zcom.js"))

const headerHeight = 32;

async function drawScreen(ctx) {
    ctx.fillStyle = "darkcyan"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    ctx.fillStyle = "cyan";
    ctx.font = "bold 14px comic-sans";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(`Alt+Shift+Q - выключить оконный менеджер | Alt+Enter - включить zterm | Alt+Shift+C - закрыть окно`, 10, 16);

    for (const win of window.mxwm_windows) {
        drawWindowDecorations(
            ctx,
            win.wid == selected_window,
            win.x,
            win.y,
            win.width,
            win.height,
            win.title
        )
        ctx.drawImage(win.canvas, win.x, win.y);
    }
}

async function drawWindowDecorations(ctx, is_selected, x, y, width, height, title) {
    const borderRadius = 8;
    const borderWidth = 1;
    const buttonRadius = 6;
    const buttonSpacing = 8;

    const outerX = x - borderWidth - 1;
    const outerY = y - headerHeight - borderWidth - 2;
    const outerWidth = width + borderWidth * 2 + 2;
    const outerHeight = height + headerHeight + borderWidth * 2 + 3;

    ctx.fillStyle = is_selected ? "#f4f4f4" : "#d3f4d3";
    ctx.fillRect(outerX, outerY, outerWidth, outerHeight)

    ctx.fillStyle = "#222";
    ctx.font = "bold 14px sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(title, outerX + 12, outerY + headerHeight / 2);
}

async function onStart(screen_ctx) {
    
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

    if ((isPressed("Alt") || isPressed("Meta")) && isPressed("Shift") && isPressed("C")) {
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
            dragging_window = window["wid"]
            selected_window = window["wid"]
            setGraphicsCursor("grabbing")
            moveWindowToTop(window.wid)
            break
        }
        if (isMouseOnCorner(window) ||
            ((selected_window == window.wid || isMouseInside(window))
                && isPressed("Alt") && button == 2)) {
            resizing_window = window["wid"]
            selected_window = window["wid"]
            setGraphicsCursor("nwse-resize")
            moveWindowToTop(window.wid)
            break
        }
        if (isMouseInside(window)) {
            selected_window = window["wid"]
            moveWindowToTop(window.wid)
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
        if (isMouseOnHeader(getWindow(dragging_window)))
            setGraphicsCursor("grab")
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

async function onMouseMove(ctx, x, y) {
    let cursor = "default"
    
    if (dragging_window != null) { 
        let window = getWindow(dragging_window)
        moveWindow(
            dragging_window,
            window.x + (x - mouse_position[0]),
            window.y + (y - mouse_position[1]),
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
            window.width + (x - mouse_position[0]),
            window.height + (y - mouse_position[1])
        )
        cursor = "nwse-resize"
    }
    
    mouse_position = [x, y]

    for (let window of listWindows()) {
        if (isMouseInside(window)) {
            window.onmousemove(mouse_position[0] - window.x, mouse_position[1] - window.y)
        }
        if (dragging_window == null && isMouseOnHeader(window)) {
            cursor = "grab"
        }
        if (isMouseOnCorner(window)) {
            cursor = "nwse-resize"
        }
    }

    setGraphicsCursor(cursor)
}

async function main(args) {
    let ctx = null
    
    enableGraphics({
        "onmousemove": (x, y) => onMouseMove(ctx, x, y),
        "onmousedown": (btn) => onMouseDown(ctx, btn),
        "onmouseup": (btn) => onMouseUp(ctx, btn),
        "onkeydown": (key) => onKeyDown(ctx, key),
        "onkeyup": (key) => onKeyUp(ctx, key)
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
