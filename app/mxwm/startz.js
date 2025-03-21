eval(readFile("/app/zcom.js"))

async function main(args) {
    enableGraphics()

    window.mxwm_windows = []

    let ctx = getGraphics()

    let run = true

    (async () => {
        setStdinFlag(SILENT_STDIN)
        setStdinFlag(ENABLE_STDIN)

        while (true) {
            let event = await pollStdinEvent()

            if (event.type == "key") {
                if (event.key == "Escape") {
                    run = false
                    break
                }
            }
        }
        
        setStdinFlag(RENDER_STDIN)
        setStdinFlag(DISABLE_STDIN)
    })()

    while (run) {
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