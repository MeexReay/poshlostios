var fs_mapping = {}

function saveMapping() {
    localStorage.setItem("fs_mapping", JSON.stringify(fs_mapping))
}

function loadMapping() {
    if (localStorage.getItem("fs_mapping") == null) {
        fs_mapping = {}
    } else {
        fs_mapping = JSON.parse(localStorage.getItem("fs_mapping"))
    }
}

loadMapping()

function getMappingCode(path) {
    let parts = (path.startsWith("/") ? path.slice(1) : path).split("/")
    let now = fs_mapping

    let index = 0
    for (const part of parts) {
        if (Object.keys(now).includes(part)) {
            if (index == parts.length-1) {
                return "file_"+now[part]
            } else {
                now = now[part]
            }
        } else {
            return null
        }
        index++
    }
    return null
}

function createMappingCode(path) {
    if (path.length === 0) return null

    let code = 0, i, chr

    for (i = 0; i < path.length; i++) {
        chr = path.charCodeAt(i)
        code = ((code << 5) - code) + chr
        code |= 0
    }

    let parts = (path.startsWith("/") ? path.slice(1) : path).split("/")
    let now = fs_mapping

    let index = 0
    for (const part of parts) {
        if (index == parts.length-1) {
            now[part] = code
        } else if (Object.keys(now).includes(part)) {
            now = now[part]
        } else {
            return null
        }
        index++
    }
    saveMapping()

    return "file_"+code
}

function createMappingFolder(path) {
    let parts = (path.startsWith("/") ? path.slice(1) : path).split("/")
    let now = fs_mapping

    let index = 0
    for (const part of parts) {
        if (index == parts.length-1) {
            now[part] = {}
        } else if (Object.keys(now).includes(part)) {
            now = now[part]
        } else {
            return null
        }
        index++
    }
    saveMapping()
    return null
}

function listMappingFolder(path) {
    if (path == "/") return Object.keys(fs_mapping)
    let parts = (path.startsWith("/") ? path.slice(1) : path).split("/")
    let now = fs_mapping

    let index = 0
    for (const part of parts) {
        if (Object.keys(now).includes(part)) {
            if (index == parts.length-1) {
                return Object.keys(now[part])
            } else {
                now = now[part]
            }
        } else {
            return null
        }
        index++
    }
    return null
}

function isMappingFolder(path) {
    let parts = (path.startsWith("/") ? path.slice(1) : path).split("/")
    let now = fs_mapping

    let index = 0
    for (const part of parts) {
        if (Object.keys(now).includes(part)) {
            if (index == parts.length-1) {
                return typeof now[part] === "object"
            } else {
                now = now[part]
            }
        } else {
            return null
        }
        index++
    }
    return null
}

function removeMappingEntry(path) {
    let parts = (path.startsWith("/") ? path.slice(1) : path).split("/")
    let now = fs_mapping

    let index = 0
    for (const part of parts) {
        if (Object.keys(now).includes(part)) {
            if (index == parts.length-1) {
                delete now[part]

                saveMapping()
            } else {
                now = now[part]
            }
        } else {
            return null
        }
        index++
    }
    return null
}

function readFile(path) {
    path = simplifyPath(path)
    return localStorage.getItem(getMappingCode(path))
}

function writeFile(path, content) {
    path = simplifyPath(path)
    let code = getMappingCode(path)
    if (code == null) code = createMappingCode(path)
    localStorage.setItem(code, content)
} 

function hasFile(path) {
    path = simplifyPath(path)
    return getMappingCode(path) != null
} 

function listFiles(path) {
    path = simplifyPath(path)
    return listMappingFolder(path)
}

function createFolder(path) {
    createMappingFolder(simplifyPath(path))
}

function removeFile(path) {
    path = simplifyPath(path)
    if (!isFolder(path)) {
        localStorage.removeItem(getMappingCode(path))
    }
    removeMappingEntry(path)
}

function isFolder(path) {
    path = simplifyPath(path)
    return isMappingFolder(path)
}

function simplifyPath(path) {
    if (!path.startsWith("/")) path = cwd+"/" + path;

    const segments = path.split('/');
    const stack = [];

    for (let segment of segments) {
        if (segment === '' || segment === '.') {
            continue;
        } else if (segment === '..') {
            if (stack.length > 0) {
                stack.pop();
            }
        } else {
            stack.push(segment);
        }
    }

    const simplifiedPath = '/' + stack.join('/');
    return simplifiedPath;
}

function clearFileSystem() {
    let callback = (x) => {
        for (const o of Object.values(x)) {
            if (typeof o === "object") {
                callback(o)
            } else {
                localStorage.removeItem("file_"+o)
            }
        }
    }
    callback(fs_mapping)
    fs_mapping = {}
    saveMapping()
}

function getFileSystemSize() {
    let total = 0
    for (let x in localStorage) {
        if (!localStorage.hasOwnProperty(x)) {
            continue;
        }
        let len = ((localStorage[x].length + x.length) * 2)
        total += len
    }
    return total
}
