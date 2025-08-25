const CHAR_SIZE = [10, 22]
const CURSOR_OFFSET = [10, 10]

function getTerminalSize() {
    return [
        Math.round((window.innerWidth - CURSOR_OFFSET[0] * 2) / CHAR_SIZE[0]),
        Math.round((window.innerHeight - CURSOR_OFFSET[1] * 2) / CHAR_SIZE[1])
    ]
}

var terminal_element = document.getElementById("terminal")
var terminal = {
    "stdout": "",
    "stdin": "",
    "cursor": [0, 0],
    "text": "",
    "size": getTerminalSize(),
    "silent_stdin": false,
    "disable_stdin": true,
    "update": updateTerminal
}

function getStrippedTerminal() {
    return stripColors(terminal.text)
}

function updateTerminal() {
    if (!terminal.silent_stdin) {
        let stripped_terminal = getStrippedTerminal()
        terminal.cursor = [
            stripped_terminal.split("\n").reverse()[0].length, 
            stripped_terminal.split("\n").length-1
        ]
    }
    
    terminal_element.innerHTML = convertColorCodes(stripHtml(terminal.text))
}

var cursor = document.getElementById("cursor")

function updateCursor() {
    cursor.style["top"] = terminal.cursor[1] * CHAR_SIZE[1] + CURSOR_OFFSET[1] + "px"
    cursor.style["left"] = terminal.cursor[0] * CHAR_SIZE[0] + CURSOR_OFFSET[0] + "px"
    cursor.scrollIntoView({behavior: "smooth", inline: "end"})
}

function stripColors(input) {
    return input.replace(/\$#([0-9a-fA-F]{6})/g, "")
                .replace(/\$([A-Z_]+)--/g, "")
                .replace(/\$reset/g, "")
}

function makeColorCodesPrintable(input) {
    return input.replace(/\$#([0-9a-fA-F]{6})/g, "$$##$1")
                .replace(/\$([A-Z_]+)--/g, "$$#$1--")
                .replace(/\$reset/g, "$$#reset")
}

function convertColorCodes(input) {
    return input.replace(/\$#([0-9a-fA-F]{6})/g, '<span style="color: #$1">')
                .replace(/\$##([0-9a-fA-F]{6})/g, '$$#$1')
                .replace(/\$([A-Z_]+)--/g, '<span style="color: var(--$1)">')
                .replace(/\$#([A-Z_]+)--/g, '$$$1--')
                .replace(/\$reset/g, '</span>')
                .replace(/\$#reset/g, '$$reset');
}

function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerText = html;
    return tmp.innerHTML;
}

var clipboard_collect = document.getElementById("clipboard-collect")

document.onkeydown = (e) => {
    let key = e.key;
    
    if (!terminal.disable_stdin) {
        if (key == "Enter") {
            terminal.stdin += "\n"
            if (!terminal.silent_stdin) {
                terminal.text += "\n"
            }
        } else if (key.length == 1) {
            if (key == "\0") return
            if (e.ctrlKey && key == "v") return
            terminal.stdin += key
            if (!terminal.silent_stdin) {
                terminal.text += key;
            }
        } else {
            terminal.stdin += "\r"+(e.ctrlKey ? "1" : "0")+(e.altKey ? "1" : "0")+(e.shiftKey ? "1" : "0")+e.key+"\r"
        }
    }
}

setInterval(() => {
    try {
        if (graphics_canvas == null) {
            clipboard_collect.focus()
        }
    } catch (e) {}
});

clipboard_collect.onpaste = (e) => {
    let paste = (e.clipboardData || window.clipboardData).getData("text");

    if (paste != null) {
        terminal.stdin += paste.replace("\r", "")
        terminal.text += paste;
    }
}

setInterval(() => {
    terminal.size = getTerminalSize()
    updateTerminal()
    updateCursor()
}, 10);
