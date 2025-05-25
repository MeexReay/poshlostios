eval(readFile("/app/zcom.js"))

async function draw(ctx) {
    ctx.fillStyle = "darkgray";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

async function main(args) {
    let wid, ctx

    [wid, ctx] = createWindow({ 
        "title": "sexp",
        "x": 50,
        "y": 50,
        "width": 500,
        "height": 500,
        "onresize": () => draw(ctx)
    })

    draw(ctx)

    while (graphics_canvas != null) {
        await new Promise(resolve => setTimeout(resolve, 100))
        draw(ctx)
    }

    closeWindow(wid)
    
    return 0
}
