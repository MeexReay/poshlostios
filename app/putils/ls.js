async function main(args) {
    if (args.length < 2) {
        writeStdout(listFiles(".").map(o => {
            return (isFolder(o) ? "DIR " : "FILE") + " " + simplifyPath(o)
        }).join("\n")+"\n")
    } else {
        writeStdout(listFiles(args[1]).map(o => {
            return (isFolder(args[1]+"/"+o) ? "DIR " : "FILE") + " " + simplifyPath(args[1]+"/"+o)
        }).join("\n")+"\n")
    }
    return 0
}