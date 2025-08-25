const RENDER_STDIN = 1
const SILENT_STDIN = 2
const DISABLE_STDIN = 3
const ENABLE_STDIN = 4

async function readLine(on_key=(key, ctrl, alt, shift, content, pos) => [content, pos]) {
    setStdinFlag(ENABLE_STDIN)

    let start_terminal = terminal.text

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
                    terminal.text = start_terminal + content
                    let cursor = getCursor()
                    setCursor(cursor[0]-1, cursor[1])
                }
            } else if (event.key == "Delete") {
                content = content.slice(0, pos) + content.slice(pos + 1)
                terminal.text = start_terminal + content
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
                terminal.text = terminal.text.slice(0, terminal.text.length - content.length) + res[0]
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
    while (terminal.stdin.length == 0) {
        await new Promise(resolve => setTimeout(resolve, 10))
    }
    let was_stdin = terminal.stdin.charAt(0)
    terminal.stdin = terminal.stdin.slice(1)
    return was_stdin
}

async function writeStdout(content) {
    terminal.stdout += content
    terminal.text += content
}

function setStdinFlag(flag) {
    if (flag == SILENT_STDIN) {
        terminal.silent_stdin = true
    } else if (flag == RENDER_STDIN) {
        terminal.silent_stdin = false
    } else if (flag == DISABLE_STDIN) {
        terminal.disable_stdin = true
    } else if (flag == ENABLE_STDIN) {
        terminal.disable_stdin = false
    }
}

function getCursorIndex() {
    let lines = terminal_text.split("\n");
    let index = 0;

    for (let y = 0; y < lines.length; y++) {
        let line = lines[y];
        // let strippedLine = stripColors(line);
        // let length = strippedLine.length;

        if (y === cursor_pos[1]) {
            let visiblePos = cursor_pos[0];
            let realPos = 0;
            let visibleCount = 0;

            for (let i = 0; i < line.length; i++) {
                if (line[i] === "$") {
                    let match = line.substring(i).match(/^(\$#([0-9a-fA-F]{6})|\$[A-Z_]+--|\$reset)/);
                    if (match) {
                        i += match[0].length - 1;
                        realPos += match[0].length;
                        continue;
                    }
                }

                if (visibleCount === visiblePos) {
                    return index + realPos;
                }

                visibleCount++;
                realPos++;
            }

            return index + realPos;
        }

        index += line.length + 1;
    }

    return index;
}

function getCursor() {
    return terminal.cursor
}

function setCursor(x, y) {
    terminal.cursor = [x, y]
}
