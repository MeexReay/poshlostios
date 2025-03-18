async function main(args) {
    if (!hasFile(args[1])) {
        writeStdout(`я вахуе ну ты же знаешь что такого файла нет нахуй ты это делаешь\n`)
        return 1
    }
    removeFile(args[1])
    writeStdout(`ну все твой файл ${args[1]} удален ДОВОЛЕН ЧТО ТЫ СДЕЛАЛ?\n`)
    return 0
}