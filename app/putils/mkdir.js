async function main(args) {
    createFolder(args[1])
    writeStdout(`папка создана ${args[1]}\n`)
    return 0
}