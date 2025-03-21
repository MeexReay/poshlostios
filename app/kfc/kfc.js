
async function main(args) {
    if (args.length != 2) {
        writeStdout(`Usage: kfc <file>\n`)
        return 1
    }

    let content = readFile(args[1])

    let pos = getCursor()

    setStdinFlag(SILENT_STDIN)

    while (true) {
        let event = await pollStdinEvent()

        console.log(event)

        if (event.type == "key") {
            if (event.key == "Escape") {
                break
            }

            writeStdout(event.key + "\n")
        } else if (event.type == "char") {
            writeStdout(event.char + "\n")
        }
    }

    setStdinFlag(RENDER_STDIN)

    return 0
}