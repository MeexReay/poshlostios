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

function isPressed(key) {
    return pressedKeys.indexOf(key) !== -1
}

async function onKeyDown(ctx, key) {
    if (pressedKeys.indexOf(key) === -1) {
        pressedKeys.push(key)
    }

    console.log(pressedKeys)
    
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
    
    console.log(pressedKeys)
    
    if (selected_window != null) getWindow(selected_window).onkeyup(key)
}

let dragging_window = null
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

async function onMouseDown(ctx, button) {
    for (let window of listWindows()) {
        if (isMouseOnHeader(window)) {
            dragging_window = window["wid"]
            selected_window = window["wid"]
            setGraphicsCursor("grabbing")
            moveWindowToTop(window.wid)
        }
        if (isMouseInside(window)) {
            selected_window = window["wid"]
            moveWindowToTop(window.wid)
            window.onmousedown(button)
        }
    }
}

async function onMouseUp(ctx, button) {
    for (let window of listWindows()) {
        if (isMouseOnHeader(window)) {
            dragging_window = null
            setGraphicsCursor("grab")
        }
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
        if (isMouseOnHeader(window)) {
            window.x += x - mouse_position[0]
            window.y += y - mouse_position[1]
            cursor = "grabbing"
        }
    }
    
    mouse_position = [x, y]   

    for (let window of listWindows()) {
        if (isMouseInside(window)) {
            window.onmousemove(mouse_position[0] - window.x, mouse_position[1] - window.y)
        }
        if (dragging_window == null && isMouseOnHeader(window)) {
            cursor = "grab"
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
