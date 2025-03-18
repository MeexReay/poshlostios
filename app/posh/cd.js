async function main(args) {
    if (!hasFile(args[1])) {
        writeStdout(`нет такой папки бро\n`)
        return 1
    }
    cwd = simplifyPath(args[1])
    writeStdout(`бро переместил тебя в ${args[1]} без б ваще обращайся\n`)
    return 0
}