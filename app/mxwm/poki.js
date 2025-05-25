eval(readFile("/app/zcom.js"))

/*

 Poki - MXWM taskbar deck

*/

let wid = null
let ctx = null

const HEIGHT = 64

const APPS = [
    {
        "id": "zterm",
        "title": "zterm - terminal emulator",
        "icon": "app/mxwm/zterm.png",
        "script": ["/app/zterm.js"]
    }
]

const ICON_SIZE = 60
const ICON_PADDING = 4

function findRect() {
    return [0, graphics_canvas.height - HEIGHT, graphics_canvas.width, HEIGHT]
}

async function draw() {
    ctx.fillStyle = "darkgray";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    let x = ICON_PADDING

    for (let app of APPS) {
        ctx.drawImage(app.icon_image, x, ICON_PADDING, ICON_SIZE, ICON_SIZE)
        x += ICON_SIZE + ICON_PADDING
    }
}

async function onUpdate() {
    let rect = findRect()

    moveWindow(wid, rect[0], rect[1], rect[2], rect[3])

    draw()
}

let mouse_position = [0, 0]

async function onMouseMove(x1, y) {
    mouse_position = [x1, y]

    let cursor = "default"
    
    let x = ICON_PADDING
    for (let app of APPS) {
        if (mouse_position[0] >= x &&
            mouse_position[1] >= ICON_PADDING &&
            mouse_position[0] <= x + ICON_SIZE &&
            mouse_position[1] <= ICON_PADDING + ICON_SIZE) {
            cursor = "pointer"
        }
        x += ICON_SIZE + ICON_PADDING
    }

    console.log(cursor)

    setGraphicsCursor(cursor)
}

async function onMouseDown(button) {
    if (button == 0) {
        let x = ICON_PADDING
        for (let app of APPS) {
            if (mouse_position[0] >= x &&
                mouse_position[1] >= ICON_PADDING &&
                mouse_position[0] <= x + ICON_SIZE &&
                mouse_position[1] <= ICON_PADDING + ICON_SIZE) {
                executeCommand(app.script)
            }
            x += ICON_SIZE + ICON_PADDING
        }
    }
}

async function main(args) {
    for (let app of APPS) {
        app.icon_image = await fetch(app.icon)
            .then(r => r.blob())
            .then(r => createImageBitmap(r))
    }
    
    let rect = findRect()

    let d = createWindow({ 
        "title": "poki deck",
        "x": rect[0],
        "y": rect[1],
        "width": rect[2],
        "height": rect[3],
        "onupdate": onUpdate,
        "onmousemove": onMouseMove,
        "onmousedown": onMouseDown,
        "resizable": false,
        "selectable": false,
        "movable": false,
        "closable": false,
        "decorated": false
    })

    wid = d[0]
    ctx = d[1]

    draw()

    while (graphics_canvas != null) {
        await new Promise(resolve => setTimeout(resolve, 100))
        draw()
    }

    closeWindow(wid)
    
    return 0
}
