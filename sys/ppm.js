async function fetchPackage(url) {
    try {
        return await fetchJson(url+"/package.json")
    } catch (error) {
        return null
    }
}

async function getInstalledPackage(name) {
    if (!hasFile("/etc/ppm/"+name)) {
        return null
    }

    return JSON.parse(readFile("/etc/ppm/"+name))
}

async function listPackages() {
    let packages = []
    for (const name of listFiles("/etc/ppm")) {
        packages.push(JSON.parse(readFile("/etc/ppm/"+name)))
    }
    return packages
}

async function fetchJson(url) {
    for (let i = 0; i < 10; i++) {
        try {
            return await fetch(url).then(o => o.json())
        } catch (error) {
            continue
        }
    }
    return null
}

async function fetchText(url) {
    for (let i = 0; i < 10; i++) {
        try {
            return await fetch(url).then(o => o.text())
        } catch (error) {
            continue
        }
    }
    return null
}

async function installPackage(url) {
    let package
    try {
        package = await fetch(url+"/package.json").then(o => o.json())
    } catch (error) {
        return 2
    }
    
    if (!hasFile("/etc/ppm")) {
        createFolder("/etc/ppm")
    }

    if (hasFile("/etc/ppm/"+package["name"])) {
        return 1
    }

    if ("apps" in package) {
        for (const app of package.apps) {
            writeFile("/app/"+app, await fetchText(url+"/"+app))
        }
    }

    if ("configs" in package) {
        for (const config of package.configs) {
            writeFile("/config/"+config, await fetchText(url+"/"+config))
        }
    }

    writeFile("/etc/ppm/"+package["name"], JSON.stringify(package))

    return 0
}

async function removePackage(name) {
    let package = await getInstalledPackage(name)

    if (package == null) return false

    if ("apps" in package) {
        for (const app of package.apps) {
            removeFile("/app/"+app)
        }
    }

    if ("configs" in package) {
        for (const config of package.configs) {
            removeFile("/config/"+config)
        }
    }

    removeFile("/etc/ppm/"+name)

    return true
}

async function updatePackage(name, url) {
    let package = await getInstalledPackage(name)

    if (package == null) return 1

    if ("apps" in package) {
        for (const app of package.apps) {
            removeFile("/app/"+app)
        }
    }
    
    try {
        package = await fetch(url+"/package.json").then(o => o.json())
    } catch (error) {
        return 2
    }

    if ("apps" in package) {
        for (const app of package.apps) {
            writeFile("/app/"+app, await fetchText(url+"/"+app))
        }
    }

    writeFile("/etc/ppm/"+name, JSON.stringify(package))

    return 0
}