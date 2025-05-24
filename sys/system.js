var cwd = "/home"

var stdout = ""
var stdin = ""

var disable_stdin = true
var silent_stdin = false

var processes = []

const RENDER_STDIN = 1
const SILENT_STDIN = 2
const DISABLE_STDIN = 3
const ENABLE_STDIN = 4

const EXECUTE_COMMAND_CODE = `
function executeCommand(
    args,
    read=readStdin,
    write=writeStdout,
    set_flag=setStdinFlag,
    read_line=readLine,
    poll_stdin=pollStdinEvent,
    inject=""
) {
    let id = new Date().getMilliseconds().toString()+(Math.random()*100)
    let func_content = readFile(args[0])
    if (func_content == null || !func_content.includes("function main")) return
    let func = new Function(
        "args", "readStdin", "writeStdout", "setStdinFlag", "readLine", "pollStdinEvent",
        EXECUTE_COMMAND_CODE+"\\n"+inject+"\\n"+func_content+"\\nreturn main(args)"
    )
    let process = {
        "id": id,
        "name": args.join(" "),
        "promise": new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(func(args, read, write, set_flag, read_line, poll_stdin))
                } catch (e) {
                    reject(e)
                }
            }, 0)
        }).then(o => {
            processes = processes.filter(x => x.id != id)
            return o
        })
    }
    processes.push(process)
    return process
}`


async function readLine(on_key=(key, ctrl, alt, shift, content, pos) => [content, pos]) {
    setStdinFlag(ENABLE_STDIN)

    let start_terminal = getTerminal()

    let start_cursor_pos = getCursor()

    let pos = 0
    let content = ""

    while (true) {
        let event = await pollStdinEvent()

        if (event.type == "key") {
            if (event.key == "Backspace") {
                if (pos >= 1) {
                    content = content.slice(0, pos - 1) + content.slice(pos)
                    pos -= 1
                    setTerminal(start_terminal + content)
                    let cursor = getCursor()
                    setCursor(cursor[0]-1, cursor[1])
                    updateTerminalWOCursor()
                }
            } else if (event.key == "Delete") {
                content = content.slice(0, pos) + content.slice(pos + 1)
                setTerminal(start_terminal + content)
                updateTerminalWOCursor()
            } else if (event.key == "ArrowLeft") {
                let cursor = getCursor()
                if (cursor[0] > start_cursor_pos[0]) {
                    setCursor(cursor[0]-1, cursor[1])
                    pos -= 1
                }
            } else if (event.key == "ArrowRight") {
                let cursor = getCursor()
                if (cursor[0] < start_cursor_pos[0] + content.length) {
                    setCursor(cursor[0]+1, cursor[1])
                    pos += 1
                }
            } else {
                let res = on_key(event.key, event.ctrl, event.alt, event.shift, content, pos)
                terminal_text = terminal_text.slice(0, terminal_text.length - content.length) + res[0]
                updateTerminal()
                setCursor(start_cursor_pos[0] + res[1], start_cursor_pos[1])
                content = res[0]
                pos = res[1]
            }

            continue
        } else if (event.type == "char") {
            if (event.char == "\n") break
            if (event.char == "\0") continue

            content = content.slice(0, pos) + event.char + content.slice(pos)
            pos += 1
        }
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

async function readStdin() {
    while (stdin.length == 0) {
        await new Promise(resolve => setTimeout(resolve, 10))
    }
    let was_stdin = stdin.charAt(0)
    stdin = stdin.slice(1)
    return was_stdin
}

async function writeStdout(content) {
    stdout += content
    writeTerminal(content)
}

function setStdinFlag(flag) {
    if (flag == SILENT_STDIN) {
        silent_stdin = true
    } else if (flag == RENDER_STDIN) {
        silent_stdin = false
    } else if (flag == DISABLE_STDIN) {
        disable_stdin = true
    } else if (flag == ENABLE_STDIN) {
        disable_stdin = false
    }
}

async function resetSystem() {
    clearFileSystem()

    createFolder("/")
    createFolder("/home")
    createFolder("/app")
    createFolder("/config")
    createFolder("/temp")
    createFolder("/etc")

    for (const app of DEFAULT_APPS) {
        await installPackage(APP_REPOSITORY + "/" + app)
    }
}

eval(EXECUTE_COMMAND_CODE)

if (Object.keys(fs_mapping).length == 0) {
    resetSystem()
}
    
executeCommand(STARTUP_COMMAND)

var start_date = new Date()
