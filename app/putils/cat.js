async function main(args) {
    if (!hasFile(args[1])) {
        writeStdout(`нет такой faila бро\n`)
        return 1
    }
    writeStdout(readFile(args[1])+"\n")
    return 0
}