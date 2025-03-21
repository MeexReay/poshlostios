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

async function printScreen(screen_length, start_cursor, pos, content, mode, pos, x, y, width, height) {
    trimTerminal(getTerminal().length - screen_length)
    let screen = await cropToScreen(content, 0, 0, width, height - 1)
    await writeStdout(screen)
    let status_line = `\nmode: ${mode} | size: ${content.length} | lines: ${content.split("\n").length} | x: ${pos[0]} | y: ${pos[1]}`
    await writeStdout(status_line)
    setCursor(start_cursor[0] + pos[0], start_cursor[1] + pos[1])
    return [screen.length + status_line.length, status_line.length - 1]
}

async function main(args) {
    if (args.length != 2) {
        writeStdout(`Usage: kfc <file>\n`)
        return 1
    }


    let content = readFile(args[1])

    let mode = "normal"
    let pos = [0, 0]

    let start_cursor = getCursor()
    let [width, height] = getTerminalSize()
    let [screen_length, status_length] = await printScreen(0, start_cursor, pos, content, mode, pos, 0, 0, width, height)


    setStdinFlag(ENABLE_STDIN)
    setStdinFlag(SILENT_STDIN)

    while (true) {
        let event = await pollStdinEvent()

        console.log(event)

        if (event.type == "key") {
            if (event.key == "Backspace") {

            } else if (event.key == "Delete") {
                
            } else if (event.key == "ArrowUp") {
                pos[1] = Math.max(0, pos[1] - 1)
            } else if (event.key == "ArrowDown") {
                pos[1] = Math.min(height - 2, pos[1] + 1)
            } else if (event.key == "ArrowLeft") {
                pos[0] = Math.max(0, pos[0] - 1)
            } else if (event.key == "ArrowRight") {
                pos[0] = Math.min(height - 1, pos[0] + 1)
            } else if (event.key == "Escape") {
                mode = "normal"
            } else if (event.key == "Insert") {
                mode = "insert"
            }
        } else if (event.type == "char") {
            if (mode == "normal") {
                if (event.char == ":") {
                    trimTerminal(getTerminal().length - status_length)
                    writeStdout(":")
    
                    let command = readLine()
    
                    setStdinFlag(ENABLE_STDIN)
                    setStdinFlag(SILENT_STDIN)
    
                    if (command == "w") {
                        // save
                    } else if (command == "q") {
                        break
                    } else if (command == "x") {
                        // save
    
                        break
                    }
                } else if (event.char == "i") {
                    mode = "insert"
                }
            } else if (mode == "insert") {
                
            }
        }

        let res = await printScreen(screen_length, start_cursor, pos, content, mode, pos, 0, 0, width, height)
        screen_length = res[0]
        status_length = res[1]
    }

    setStdinFlag(RENDER_STDIN)
    setStdinFlag(DISABLE_STDIN)

    await writeStdout("\n")

    return 0
}