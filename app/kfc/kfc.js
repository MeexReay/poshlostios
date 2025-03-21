
async function main(args) {
    if (args.length != 2) {
        writeStdout(`Usage: kfc <file>\n`)
        return 1
    }

    let content = readFile(args[1])

    let pos = getCursor()

    setStdinFlag(ENABLE_STDIN)
    setStdinFlag(SILENT_STDIN)

    while (true) {
        let event = await pollStdinEvent()

        console.log(event)

        if (event.type == "key") {
            if (event.key == "Escape") {
                break
            }

            writeStdout(event + "\n")
        } else if (event.type == "char") {
            writeStdout(event + "\n")
        }
    }

    setStdinFlag(RENDER_STDIN)

    return 0
}