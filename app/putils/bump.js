async function main(args) {
    writeFile(args[1], "")
    writeStdout(`все твой файл создан ${args[1]} такой же ты хотел жа\n`)
    return 0
}