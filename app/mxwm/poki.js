eval(readFile("/app/zcom.js"))

/*

 Poki - MXWM taskbar deck

*/

let wid = null
let ctx = null

const HEIGHT = 64

function findRect() {
    return [0, graphics_canvas.height - HEIGHT, graphics_canvas.width, HEIGHT]
}

async function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

async function onUpdate() {
    let rect = findRect()

    moveWindow(wid, rect[0], rect[1], rect[2], rect[3])

    draw()
}

async function main(args) {
    let rect = findRect()

    let d = createWindow({ 
        "title": "poki deck",
        "x": rect[0],
        "y": rect[1],
        "width": rect[2],
        "height": rect[3],
        "onupdate": onUpdate,
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
    }

    closeWindow(wid)
    
    return 0
}
