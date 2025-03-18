async function main(args=["","",""]) {
    let source = simplifyPath(args[1])
    let target = simplifyPath(args[2])

    if (!hasFile(args[1])) {
        writeStdout(`бро я б помог сделал что ты хочешь но сука нет такого файла бай бай\n`)
        return 1
    }

    if (isFolder(source)) {
        if (!hasFile(target) || isFolder(target)) {
            let create_dirs = hasFile(target) ? [] : [target]
            let write_files = []

            let recursive = (folder) => {
                for (const file of listFiles(folder)) {
                    let path = folder+"/"+file
                    if (isFolder(path)) {
                        create_dirs.push(path)
                        recursive(path)
                    } else {
                        write_files.push(path)
                    }
                }
            }

            recursive(source)

            for (const dir of create_dirs) {
                createFolder(target + dir.slice(source.length))
            }

            for (const file of write_files) {
                let path = target + file.slice(source.length)
                writeFile(path, readFile(file))
            }
        } else {
            writeStdout("как по твоему я должен блять переместить папку в файл ты ебнутый сука\n")
            return 1
        }
    } else {
        if (isFolder(target)) {
            target = target+"/"+source.split("/").reverse()[0]
        }

        let content = readFile(source)
        writeFile(target, content)
    }

    removeFile(source)

    writeStdout(`все перемещено чо надо то есть ${source} в ${target} ну изи получается\n`)

    return 0
}