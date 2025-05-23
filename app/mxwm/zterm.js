eval(readFile("/app/zcom.js"))

let text = ""
let stdin_text = ""
let stdin_visible = true
let stdin_disable = true

async function draw(ctx) {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    let y = 500 - 12
    for (let line of text.split("\n").reverse()) {
        ctx.fillStyle = "white";
        ctx.font = "bold 14px terminus";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(line, 5, y);
        y -= 18
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
}

let altKey = false
let ctrlKey = false
let shiftKey = false

async function onKeyDown(key) {
    console.log(key)
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
        } else if (key == "Alt") {
            altKey = true
        } else if (key == "Shift") {
            shiftKey = true
        } else if (key == "Control") {
            ctrlKey = true
        } else {
            stdin_text += "\r"+(ctrlKey ? "1" : "0")+(altKey ? "1" : "0")+(shiftKey ? "1" : "0")+key+"\r"
        }
    }
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
    let wid, ctx = createWindow({
        "title": "zterm",
        "width": 500,
        "height": 500,
        "x": 50,
        "y": 50,
        "onkeydown": onKeyDown,
        "onkeyup": onKeyUp
    })

    setTimeout(() => {
        executeCommand(["/app/posh.js"], readStdin, writeStdout, setStdinFlag)
    })

    while (graphics_canvas != null) {
        draw(ctx)
        await new Promise(res => setTimeout(res, 100));
    }
}
