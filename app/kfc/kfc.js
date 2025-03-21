async function cropToScreen(text, x, y, width, height) {
    let screen = []
    let i = y
    for (const line of text.split("\n")) {
        if (i <= 0) {
            screen.push(line.slice(x, width + x))
            if (screen.length == height) {
                break
            }
        } else {
            i--
        }
    }
    for (let i = screen.length; i < height; i++) {
        screen.push("~")
    }
    return screen.join("\n")
}

async function main(args) {
    if (args.length != 2) {
        writeStdout(`Usage: kfc <file>\n`)
        return 1
    }

    let [terminal_width, terminal_height] = getTerminalSize()

    let content = readFile(args[1])

    let pos = getCursor()

    await writeStdout(await cropToScreen(content, 0, 0, terminal_width, terminal_height - 1))

    setStdinFlag(ENABLE_STDIN)
    setStdinFlag(SILENT_STDIN)

    while (true) {
        let event = await pollStdinEvent()

        console.log(event)

        if (event.type == "key") {
            if (event.key == "Escape") {
                break
            }

            writeStdout(JSON.stringify(event) + "\n")
        } else if (event.type == "char") {
            writeStdout(JSON.stringify(event) + "\n")
        }
    }

    setStdinFlag(RENDER_STDIN)
    setStdinFlag(DISABLE_STDIN)

    await writeStdout("\n")

    return 0
}