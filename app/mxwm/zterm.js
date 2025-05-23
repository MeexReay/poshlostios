eval(readFile("/app/zcom.js"))

var text = ""

async function draw(ctx) {
    ctx.fillStyle = "cyan"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.fillStyle = "#222";
    ctx.font = "bold 14px sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(text, 10, 10);
}

async function onKeyDown(key) {
    text += key
}

async function main(args) {  
    let wid, ctx = createWindow({
        "title": "zterm",
        "width": 500,
        "height": 500,
        "x": 50,
        "y": 50,
        "onkeydown": onKeyDown
    })

    while (graphics_canvas != null) {
        draw(ctx)
        await new Promise(res => setTimeout(res, 100));
    }
}
