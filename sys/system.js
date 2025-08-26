var processes = []

var io_module = null
var fs_module = null

function executeCommand(
    args,
    term
) {
    while (io_module == null || fs_module == null) {}
    let id = new Date().getMilliseconds().toString()+(Math.random()*100)
    let func_content = readFile(args[0])
    if (func_content == null || !func_content.includes("function main")) return
    let func = new Function(
        "args",
        "terminal",
        fs_module+"\n"+io_module+"\n"+func_content+"\nreturn main(args)"
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
    
fetch("/sys/io.js")
    .then(i => i.text())
    .then(i => io_module = i)
    .then(_ => fetch("/sys/fs.js"))
    .then(i => i.text())
    .then(i => fs_module = i)
    .then(_ => executeCommand(STARTUP_COMMAND, terminal))

var start_date = new Date()
