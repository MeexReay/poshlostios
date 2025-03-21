eval(readFile("/app/zcom.js"))

async function main(args) {
    enableGraphics()

    window.mxwm_windows = []

    let ctx = getGraphics()

    while (true) {
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        for (const win of window.mxwm_windows) {
            ctx.drawImage(win.canvas, win.x, win.y);
        }

        await new Promise(resolve => setTimeout(resolve, 1000 / 60))
    }

    disableGraphics()

    return 0
}