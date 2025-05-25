/*

    PoSh - Poshlosti Shell

*/

async function processCommand(command, args) {
    let executable = command
    if (!executable.startsWith("/")) {
        if (executable.includes("/")) {
            executable = cwd + "/" + executable
        } else {
            executable = "/app/" + executable
        }
    }
    if (!hasFile(executable) && hasFile(executable+".js")) {
        executable = executable + ".js"
    }
    executable = simplifyPath(executable)

    if (hasFile(executable)) {
        try {
            let code = await executeCommand([executable].concat(args)).promise
            if (code != 0) {
                await writeStdout("\nСтатус код: "+code+"\n")
            }
        } catch (e) {
            console.log(e)
            await writeStdout("Не запустилася\n")
        }
    } else {
        await writeStdout("Твоя команда "+executable+" не найдена :3\n")
    }
}

async function main(args) {
    if (args.length > 1) {
        await processCommand(args[1], args.slice(2))
    }

    let history = [""]
    let history_index = 0

    let config = JSON.parse(readFile("/config/posh.json"))
    let prompt = config["prompt"]
    let startup = config["startup"]

    for (let command of startup) {
        let args = command.split(" ")
        await processCommand(args[0], args.slice(1))
    }

    while (true) {
        await writeStdout(prompt.replace("{cwd}", cwd))

        let command = await readLine((key, ctrl, alt, shift, content, pos) => {
            if (key == "ArrowDown") {
                history_index = Math.max(0, history_index - 1)
                return [history[history_index], history[history_index].length]
            }
        
            if (key == "ArrowUp") {
                history_index = Math.min(history.length-1, history_index + 1)
                return [history[history_index], history[history_index].length]
            }
        
            return [content, pos]
        })

        if (command.length > 0) {
            history.splice(1, 0, command);
            history_index = 0

            let args = command.split(" ")
            command = args[0]
            args = args.slice(1)
    
            if (command == "exit") {
                if (args.length == 0) {
                    return 0
                } else {
                    return parseInt(args[0])
                }
            } else {
                await processCommand(command, args)
            }
        }
    }

    return 0
}
