var cwd = "/home"

var processes = []

function executeCommand(
    args,
    term=terminal
) {
    let id = new Date().getMilliseconds().toString()+(Math.random()*100)
    let func_content = readFile(args[0])
    if (func_content == null || !func_content.includes("function main")) return
    let func = new Function(
        "args",
        "terminal",
        func_content+"\nreturn main(args)"
    )
    let process = {
        "id": id,
        "name": args.join(" "),
        "promise": new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(func(args, term))
                } catch (e) {
                    reject(e)
                }
            }, 0)
        }).then(o => {
            processes = processes.filter(x => x.id != id)
            return o
        })
    }
    processes.push(process)
    return process
}

async function resetSystem() {
    clearFileSystem()

    createFolder("/")
    createFolder("/home")
    createFolder("/app")
    createFolder("/config")
    createFolder("/temp")
    createFolder("/etc")

    for (const app of DEFAULT_APPS) {
        await installPackage(APP_REPOSITORY + "/" + app)
    }
}

if (Object.keys(fs_mapping).length == 0) {
    resetSystem()
}
    
executeCommand(STARTUP_COMMAND)

var start_date = new Date()
