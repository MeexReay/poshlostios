const CHAR_SIZE = [10, 22]
const CURSOR_OFFSET = [10, 10]

var terminal = document.getElementById("terminal")
var terminal_text = ""
var last_stdin_length = 0

function getTerminalSize() {
    return [
        Math.round((window.innerWidth - CURSOR_OFFSET[0] * 2) / CHAR_SIZE[0]),
        Math.round((window.innerHeight - CURSOR_OFFSET[1] * 2) / CHAR_SIZE[1])
    ]
}

function writeTerminalAtCursor(content) {
    let cursor_index = getCursorIndex()
    terminal_text = terminal_text.slice(0, cursor_index) + content + terminal_text.slice(cursor_index)
    setCursor(cursor_pos[0]+1, cursor_pos[1])
    last_stdin_length += 1
    updateTerminalWOCursor()
}

function writeTerminal(content) {
    terminal_text += content
    last_stdin_length = 0
    updateTerminal()
}

function replaceTerminal(content) {
    terminal_text = content
    updateTerminal()
}

function trimTerminal(length) {
    terminal_text = terminal_text.substring(0, terminal_text.length-length)
    updateTerminal()
}

function getTerminal() {
    return terminal_text
}

function setTerminal(content) {
    terminal_text = content
}

function clearTerminal() {
    terminal_text = ""
    updateTerminal()
}

function updateTerminalWOCursor() {
    terminal.innerHTML = convertColorCodes(stripHtml(terminal_text))
}

function updateTerminal() {
    setCursor(
        terminal_text.split("\n").reverse()[0].length, 
        terminal_text.split("\n").length-1
    )
    updateTerminalWOCursor()
}

var cursor = document.getElementById("cursor")
var cursor_pos = [0, 0]

function getCursorIndex() {
    let lines = terminal_text.split("\n")
    let index = 0
    for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        const length = line.length

        if (y == cursor_pos[1]) {
            return index + cursor_pos[0]
        }

        index += length + 1
    }
    return index
}

function getCursor() {
    return cursor_pos
}

function setCursor(x, y) {
    cursor_pos = [x, y]
    updateCursor()
}

function updateCursor() {
    cursor.style["top"] = cursor_pos[1] * CHAR_SIZE[1] + CURSOR_OFFSET[1] + "px"
    cursor.style["left"] = cursor_pos[0] * CHAR_SIZE[0] + CURSOR_OFFSET[0] + "px"
    cursor.scrollIntoView({behavior: "smooth", inline: "end"})
}

function stripColors(content) {
    return convertColorCodes(content)
}

function convertColorCodes(input) {
    return input.replace(/\$#([0-9a-fA-F]{6})/g, '<span style="color: #$1">')
                .replace(/\$##([0-9a-fA-F]{6})/g, '$#$1')
                .replace(/\$([A-Z_]+)--/g, '<span style="color: --$1">')
                .replace(/\$#([A-Z_]+)--/g, '$$$1--')
                .replace(/\$reset/g, '</span>')
                .replace(/\$#reset/g, '$reset');
}

function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerText = html;
    return tmp.innerHTML;
}

document.onkeydown = (e) => {
    let key = e.key;
    if (!disable_stdin) {
        if (key == "Enter") {
            stdin += "\n"
            if (!silent_stdin) {
                writeTerminal("\n")
            }
        } else if (key.length == 1) {
            if (e.ctrlKey && key == "v") return
            stdin += key
            if (!silent_stdin) {
                writeTerminalAtCursor(key)
            }
        } else {
            stdin += "\r"+(e.ctrlKey ? "1" : "0")+(e.altKey ? "1" : "0")+(e.shiftKey ? "1" : "0")+e.key+"\r"
        }
    }
}

var clipboard_collect = document.getElementById("clipboard-collect")

setInterval(() => {
    clipboard_collect.focus()
});

clipboard_collect.onpaste = (e) => {
    let paste = (e.clipboardData || window.clipboardData).getData("text");

    if (paste != null) {
        stdin += paste.replace("\r", "")
        writeTerminal(paste)
    }
}