/*

    VGet - Vulgar Get

*/

async function main(args) {
    if (args.length != 3) {
        writeStdout("vget <url> <path>\n")
        return 1
    }

    writeFile(args[2], await (await fetch(args[0])).text())
    writeStdout("Файл "+args[1]+" вставлен внутрь пути "+args[2]+"\n")

    return 0
}