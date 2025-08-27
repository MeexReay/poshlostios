eval(readFile("/app/zcom.js"))

let char_width = 7
let char_height = 14

var destterm = {
    "stdout": "",
    "stdin": "",
    "cursor": [0,0],
    "text": "",
    "size": [Math.round(500 / char_width), Math.round(500 / char_height)],
    "silent_stdin": false,
    "disable_stdin": true,
    "update": updateTerminal,
    "cwd": terminal.cwd
}

let width = 500
let height = 500

let ctx = null
let wid = null

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

async function updateTerminal() {
    if (!destterm.silent_stdin) {
        let stripped_terminal = stripColors(destterm.text)
        destterm.cursor = [
            stripped_terminal.split("\n").reverse()[0].length, 
            stripped_terminal.split("\n").length-1
        ]
    }
    
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.font = char_height+"px terminus";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
        
    let y = ctx.canvas.height - char_height / 2 - 5 + text_scroll
    for (let line of destterm.text.split("\n").reverse()) {
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

    let [curx, cury] = [ destterm.cursor[0] + 1, destterm.cursor[1] + 1 ]
    curx *= char_width
    cury *= char_height

    cury = y + cury

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff"
    ctx.beginPath()
    ctx.moveTo(curx, cury + 5)
    ctx.lineTo(curx + char_width, cury + 5)
    ctx.stroke()
}

var altKey = false
var ctrlKey = false
var shiftKey = false

async function onKeyDown(key) {
    if (key == "Alt") {
        altKey = true
    } else if (key == "Shift") {
        shiftKey = true
    } else if (key == "Control") {
        ctrlKey = true
    }

    text_scroll = 0
    if (!destterm.disable_stdin) {
        if (key == "Enter") {
            destterm.stdin += "\n"
            if (!destterm.silent_stdin) {
                destterm.text += "\n"
            }
        } else if (key.length == 1) {
            if (key == "\0") return
            if (!destterm.silent_stdin) {
                destterm.text += key
            }
            destterm.stdin += key
        } else {
            destterm.stdin += "\r"+(ctrlKey ? "1" : "0")+(altKey ? "1" : "0")+(shiftKey ? "1" : "0")+key+"\r"
        }
    }
    
    updateTerminal()
}

async function onMouseWheel(y) {
    if (ctrlKey) {
        if (y < 0) {
            char_height *= 1.05
            char_width *= 1.05
        } else {
            char_height /= 1.05
            char_width /= 1.05
        }
        updateDestTermSize()
    } else {
        text_scroll -= y * 0.5
    }

    updateTerminal()
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

function updateDestTermSize() {
    destterm.size = [Math.round(width / char_width), Math.round(height / char_height)]
}

async function main(args) {
    let run = true

    let d = createWindow({
        "title": "zterm",
        "app_id": "zterm",
        "width": 500,
        "height": 500,
        "min_width": 55,
        "min_height": 10,
        "onkeydown": onKeyDown,
        "onkeyup": onKeyUp,
        "onmousewheel": onMouseWheel,
        "onresize": (w,h) => {
            width = w
            height = h
            updateDestTermSize()
            updateTerminal()
        },
        "onsignal": (s) => {
            if (s == 9) {
                run = false
            }
        }
    })

    wid = d[0]
    ctx = d[1]

    updateTerminal()

    let command = ["/app/posh.js"]

    if (args.length > 1) {
        command = args.slice(1)
    }
    
    executeCommand(
        command,
        destterm
    ).promise.then(() => {
        run = false
    })

    while (run && graphics_canvas != null) {
        await updateTerminal()
        await new Promise(resolve =>setTimeout(resolve, 10))
    }

    ctx = null

    closeWindow(wid)

    return 0
}
