async function cropToScreen(text, x, y, width, height) {
    let screen = []
    let i = y
    for (const line of text.split("\n")) {
        if (i <= 0) {
            screen.push(line.slice(x, width + x))
            if (screen.length >= height) {
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

async function printScreen(screen_length, start_cursor, pos, content, mode, pos, camera, width, height) {
    terminal.text = terminal.text.substring(0, terminal.text.length - screen_length)
    let screen = makeColorCodesPrintable(await cropToScreen(content, camera[0], camera[1], width, height - 1))
    await writeStdout(screen)
    let status_line = `\nmode: ${mode} | size: ${content.length} | lines: ${content.split("\n").length} | x: ${camera[0]+pos[0]} | y: ${camera[1]+pos[1]}`
    await writeStdout(status_line)
    setCursor(start_cursor[0] + pos[0], start_cursor[1] + pos[1])
    return [screen.length + status_line.length, status_line.length - 1]
}

function editLine(content, line, callback) {
    let lines = content.split("\n")
    lines[line] = callback(lines[line])
    return lines.join("\n")
}

function axisToIndex(lines, pos, camera) {
    let index = 0
    for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        const length = line.length

        if (y == pos[1] + camera[1]) {
            return index + pos[0] + camera[0]
        }

        index += length + 1
    }
    return index
}

async function main(args) {
    if (args.length != 2) {
        writeStdout(`Usage: kfc <file>\n`)
        return 1
    }


    let content = readFile(args[1])

    if (content == null) {
        content = ""
    }

    let mode = "normal"
    let pos = [0, 0]
    let camera = [0, 0]

    setStdinFlag(ENABLE_STDIN)
    setStdinFlag(SILENT_STDIN)
    
    let start_cursor = getCursor()
    let [width, height] = terminal.size
    height -= 1
    let [screen_length, status_length] = await printScreen(0, start_cursor, pos, content, mode, pos, camera, width, height)

    while (true) {
        let event = await pollStdinEvent()

        console.log(event)

        if (event.type == "key") {
            if (event.key == "Backspace") {
                if (pos[0] == 0 && pos[1] == 0) {
                    continue
                }
                let index = axisToIndex(content.split("\n"), pos, camera)
                content = content.slice(0, index - 1) + content.slice(index)
                if (pos[0] > 0) {
                    pos[0]--
                } else {
                    if (pos[1] > 0) {
                        pos[1]--
                        pos[0] = content.split("\n")[pos[1] + camera[1]].length
                    }
                }
            } else if (event.key == "Delete") {
                let index = axisToIndex(content.split("\n"), pos, camera)
                content = content.slice(0, index) + content.slice(index + 1)
            } else if (event.key == "ArrowUp") {
                if (pos[1] == 0 && camera[1] > 0) camera[1]--
                pos[1] = Math.max(0, pos[1] - 1)
                pos[0] = Math.min(content.split("\n")[pos[1] + camera[1]].length, pos[0])
            } else if (event.key == "ArrowDown") {
                if (pos[1] == height - 2 && pos[1] < content.split("\n").length - camera[1]) camera[1]++
                pos[1] = Math.min(content.split("\n").length - camera[1], height - 2, pos[1] + 1)
                pos[0] = Math.min(content.split("\n").length > pos[1] + camera[1] ? content.split("\n")[pos[1] + camera[1]].length : 0, pos[0])
            } else if (event.key == "ArrowLeft") {
                pos[0] = Math.max(0, pos[0] - 1)
            } else if (event.key == "ArrowRight") {
                pos[0] = Math.min(content.split("\n").length > pos[1] + camera[1] ? content.split("\n")[pos[1] + camera[1]].length : 0, pos[0] + 1)
            } else if (event.key == "Escape") {
                mode = "normal"
            } else if (event.key == "Insert") {
                mode = "insert"
            }
        } else if (event.type == "char") {
            if (mode == "normal") {
                if (event.char == ":") {
                    terminal.text = terminal.text.substring(0, terminal.text.length - status_length)

                    writeStdout(":")
    
                    setStdinFlag(RENDER_STDIN)

                    let command = await readLine()

                    terminal.text = terminal.text.substring(0, terminal.text.length - 1)
    
                    setStdinFlag(ENABLE_STDIN)
                    setStdinFlag(SILENT_STDIN)

                    screen_length -= status_length
                    status_length = 1 + command.length
                    screen_length += status_length
    
                    if (command == "w") {
                        writeFile(args[1], content)
                    } else if (command == "q") {
                        break
                    } else if (command == "x") {
                        writeFile(args[1], content)
                        break
                    }
                } else if (event.char == "i") {
                    mode = "insert"
                } else if (event.char == "D") {
                    content = content.split("\n").slice(0, pos[1] + camera[1]).join("\n") + "\n" +
                        content.split("\n").slice(pos[1] + camera[1] + 1).join("\n")
                } else if (event.char == "d") {
                    let index = axisToIndex(content.split("\n"), pos, camera)
                    content = content.slice(0, index) + content.slice(index + 1)
                }
            } else if (mode == "insert") {
                if (content.split("\n").length == pos[1] + camera[1]) {
                    content += "\n"
                }
                content = editLine(content, pos[1] + camera[1], line => line.slice(0, pos[0] + camera[0]) + event.char + line.slice(pos[0] + camera[0]))
                if (event.char == "\n") {
                    pos[0] = 0
                    camera[1] += 1
                } else {
                    pos[0] += 1
                }
            }
        }

        let res = await printScreen(screen_length, start_cursor, pos, content, mode, pos, camera, width, height)
        screen_length = res[0]
        status_length = res[1]
    }

    setStdinFlag(RENDER_STDIN)
    setStdinFlag(DISABLE_STDIN)

    terminal.text = terminal.text.substring(0, terminal.text.length - screen_length)

    await writeStdout("\n")

    return 0
}
