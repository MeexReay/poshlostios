eval(readFile("/app/zcom.js"))

let text = ""
let stdin_text = ""
let stdin_visible = true
let stdin_disable = true
let ctx = null
let wid = null

let char_width = 7
let char_height = 14

let text_scroll = 0

const TERMINAL_COLORS = [
    "BLACK",
    "DARK_BLUE", "DARK_GREEN", "DARK_CYAN", "DARK_RED", "DARK_MAGENTA", "DARK_YELLOW", "DARK_WHITE",
    "BRIGHT_BLACK", "BRIGHT_BLUE", "BRIGHT_GREEN", "BRIGHT_CYAN", "BRIGHT_RED", "BRIGHT_MAGENTA", "BRIGHT_YELLOW",
    "WHITE"
]

function getVarColor(name) {
    return getComputedStyle(document.body).getPropertyValue("--"+name)
}

async function draw() {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.font = char_height+"px terminus";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
        
    let y = ctx.canvas.height - char_height / 2 - 5 + text_scroll
    for (let line of text.split("\n").reverse()) {
        let x = 5
        let buffer = ""
        let color_before = getVarColor("WHITE")
        let color = color_before

        for (let char of line) {
            let found_color = false;
            
            for (let term_color of TERMINAL_COLORS) {
                if (buffer.slice(buffer.length-3-term_color.length) == "$"+term_color+"--") {
                    color = getVarColor(term_color)
                    buffer = buffer.slice(0, buffer.length-term_color.length-3)
                    found_color = true
                    break
                }
            }

            if (buffer[buffer.length-8] == "$" &&
                buffer[buffer.length-7] == "#" &&
                buffer[buffer.length-6] != "#" &&
                /^[0-9a-f]+$/i.test(buffer.slice(buffer.length-6))) {
                color = buffer.slice(buffer.length-7)
                buffer = buffer.slice(0, buffer.length-8)
                found_color = true
            }

            if (buffer.endsWith("$reset")) {
                color = getVarColor("WHITE")
                buffer = buffer.slice(0, buffer.length-6)
                found_color = true
            }

            buffer = buffer.replace(/\$##([0-9a-f]{6})$/i, "\$#\$1");
            buffer = buffer.replace(/\$#([a-zA-Z]+)--$/, '\$\$1--');
            buffer = buffer.replace(/\$#reset$/, "$reset");

            if (found_color) {          
                ctx.fillStyle = color_before;
                ctx.fillText(buffer, x, y);
                color_before = color
                x += buffer.length * char_width
                buffer = ""
            }

            buffer += char
        }
        
        ctx.fillStyle = color_before;
        ctx.fillText(buffer, x, y);

        y -= char_height
    }
}

function setStdinFlag(flag) {
    if (flag == SILENT_STDIN) {
        stdin_visible = false
    } else if (flag == RENDER_STDIN) {
        stdin_visible = true
    } else if (flag == DISABLE_STDIN) {
        stdin_disable = true
    } else if (flag == ENABLE_STDIN) {
        stdin_disable = false
    }
}

async function readStdin() {
    while (stdin_text.length == 0) {
        await new Promise(resolve => setTimeout(resolve, 10))
    }
    let was_stdin = stdin_text.charAt(0)
    stdin_text = stdin_text.slice(1)
    return was_stdin
}

async function writeStdout(wh) {
    text += wh
    draw()
}

async function readLine(on_key=(key, ctrl, alt, shift, content, pos) => [content, pos]) {
    setStdinFlag(ENABLE_STDIN)

    let start_terminal = text

    // let start_cursor_pos = getCursor()

    let pos = 0
    let content = ""

    while (true) {
        let event = await pollStdinEvent()

        if (event.type == "key") {
            if (event.key == "Backspace") {
                if (pos >= 1) {
                    content = content.slice(0, pos - 1) + content.slice(pos)
                    pos -= 1
                    text = start_terminal + content
                    // let cursor = getCursor()
                    // setCursor(cursor[0]-1, cursor[1])
                    // updateTerminalWOCursor()
                }
            } else if (event.key == "Delete") {
                content = content.slice(0, pos) + content.slice(pos + 1)
                text = start_terminal + content
            //  updateTerminalWOCursor()
            // } else if (event.key == "ArrowLeft") {
            //     let cursor = getCursor()
            //     if (cursor[0] > start_cursor_pos[0]) {
            //         setCursor(cursor[0]-1, cursor[1])
            //         pos -= 1
            //     }
            // } else if (event.key == "ArrowRight") {
            //     let cursor = getCursor()
            //     if (cursor[0] < start_cursor_pos[0] + content.length) {
            //          setCursor(cursor[0]+1, cursor[1])
            //          pos += 1
            //     }
            } else {
                let res = on_key(event.key, event.ctrl, event.alt, event.shift, content, pos)
                text = text.slice(0, text.length - content.length) + res[0]
                // updateTerminal()
                // setCursor(start_cursor_pos[0] + res[1], start_cursor_pos[1])
                content = res[0]
                pos = res[1]
            }
        } else if (event.type == "char") {
            if (event.char == "\n") break
            if (event.char == "\0") continue

            content = content.slice(0, pos) + event.char + content.slice(pos)
            pos += 1
        }

        draw()
    }

    setStdinFlag(DISABLE_STDIN)

    return content
}

async function pollStdinEvent() {
    let char = await readStdin()

    if (char == "\r") {
        let key = ""
        char = await readStdin()
        while (char != "\r") {
            key += char
            char = await readStdin()
        }

        let is_ctrl = key.charAt(0) == "1"
        let is_alt = key.charAt(1) == "1"
        let is_shift = key.charAt(2) == "1"
        key = key.slice(3)

        return {
            "type": "key",
            "ctrl": is_ctrl,
            "alt": is_alt,
            "shift": is_shift,
            "key": key
        }
    }

    return {
        "type": "char",
        "char": char
    }
}

let altKey = false
let ctrlKey = false
let shiftKey = false

async function onKeyDown(key) {
    if (key == "Alt") {
        altKey = true
    } else if (key == "Shift") {
        shiftKey = true
    } else if (key == "Control") {
        ctrlKey = true
    }

    text_scroll = 0
    if (!stdin_disable) {
        if (key == "Enter") {
            stdin_text += "\n"
            if (stdin_visible) {
                text += "\n"
            }
        } else if (key.length == 1) {
            if (key == "\0") return
            if (stdin_visible) {
                text += key
            }
            stdin_text += key
        } else {
            stdin_text += "\r"+(ctrlKey ? "1" : "0")+(altKey ? "1" : "0")+(shiftKey ? "1" : "0")+key+"\r"
        }
    }
    draw()
}

async function onMouseWheel(y) {
    console.log(y)
    if (ctrlKey) {
        if (y < 0) {
            char_height *= 1.05
            char_width *= 1.05
        } else {
            char_height /= 1.05
            char_width /= 1.05
        }
    } else {
        text_scroll -= y * 0.5
    }

    draw()
}

async function onKeyUp(key) {
    if (key == "Alt") {
        altKey = false
    } else if (key == "Shift") {
        shiftKey = false
    } else if (key == "Control") {
        ctrlKey = false
    }
}

async function main(args) {
    let run = true

    let d = createWindow({
        "title": "zterm",
        "app_id": "zterm",
        "width": 500,
        "height": 500,
        "x": 50,
        "y": 50,
        "onkeydown": onKeyDown,
        "onkeyup": onKeyUp,
        "onmousewheel": onMouseWheel,
        "onresize": (w,h) => draw(),
        "onsignal": (s) => {
            if (s == 9) {
                run = false
            }
        }
    })

    wid = d[0]
    ctx = d[1]

    draw()

    executeCommand(
        ["/app/posh.js"],
        readStdin,
        writeStdout,
        setStdinFlag,
        readLine,
        pollStdinEvent
    ).promise.then(() => {
        run = false
    })

    while (run && graphics_canvas != null) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    ctx = null

    closeWindow(wid)

    return 0
}
