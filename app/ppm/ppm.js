/*

    PPM - Poshliy Package Manager

*/

let config = JSON.parse(readFile("/config/ppm.json"))

async function remove(name) {
    let pkg = await getInstalledPackage(name)
    if (pkg != null) {
        await removePackage(name)

        await writeStdout(`Пакет ${pkg['name']} удален и все его конфиги тоже\n`)
        if ("depends" in pkg) {
            await writeStdout(`Вот пакеты от которых он зависил которые не удалены: \n${pkg["depends"]}\n`)
        }

        return 0
    }

    await writeStdout("Биспокойся произошла ошибко\n")
    return 1
}

async function listInstalled() {
    return (await listPackages())
}

async function listOutdated() {
    let packages = []

    for (const pkg of (await listPackages())) {
        for (const repo of config["repositories"]) {
            let fetched = await fetchPackage(repo+"/"+pkg["name"])
            if (fetched != null) {
                if (fetched["version"] == pkg["version"]) {
                    await writeStdout(`Пакет ${pkg['name']}-${pkg['version']} уже на последней версии\n`)
                    break
                }

                packages.push(pkg)
            }
        }
    }

    return packages
}

async function update(name) {
    for (const repo of config["repositories"]) {
        let status = await updatePackage(name, repo+"/"+name)

        if (status == 0) {
            let pkg = await getInstalledPackage(name)

            await installDepends(pkg)

            await writeStdout(`Пакет ${pkg['name']}-${pkg['version']} обновлен\n`)
            return 0
        } else if (status == 1) {
            await writeStdout("чувак пакет не найден\n")
            return 1
        }
    }
    await writeStdout("чувак пакет не может быть обновлен\n")
    return 1
}

async function installDepends(pkg) {
    if ("depends" in pkg) {
        for (const dep of pkg.depends) {
            let status = await updateOrInstall(dep)

            if (status != 0) {
                return status
            }
        }
    }

    return 0
}

async function updateOrInstall(name) {
    if (await getInstalledPackage(name) == null) {
        return await install(name) 
    } else {
        return await update(name)
    }
} 

async function install(name) {
    for (const repo of config["repositories"]) {
        // await writeStdout(`Фетчим ${package} на репозитории ${repo}\n`)

        let status = await installPackage(repo+"/"+name)

        if (status == 0) {
            let pkg = await getInstalledPackage(name)

            await installDepends(pkg)

            await writeStdout(`Пакет ${pkg['name']}-${pkg['version']} установлен\n`)
            return 0
        } else if (status == 1) {
            await writeStdout("Пакет не установлен тк он уже установлен чувааак\n")
            return 1
        }
    }

    return 1
}

async function main(args) {
    if (args.length == 3 && "iurs".includes(args[1])) {
        let package = args[2]

        if (args[1] == "i") {
            return await install(package)
        } else if (args[1] == "u") {
            return await update(package)
        } else if (args[1] == "r") {
            return await remove(package)
        } else if (args[1] == "s") {
            let pkg = await getInstalledPackage(package)
            for (const [key, value] of Object.entries(pkg)) {
                await writeStdout(key.charAt(0).toUpperCase()+key.slice(1)+": "+value+"\n")
            }
            return 0
        }
    } else if (args.length == 2 && args[1] == "l") {
        await writeStdout("ваши покеты:\n")
        for (const package of (await listPackages())) {
            await writeStdout("- "+package["name"]+"-"+package["version"]+"\n")
        }        
        return 0
    } else if (args.length == 2 && args[1] == "a") {
        for (let pkg of (await listOutdated())) {
            let status = await update(pkg["name"])

            if (status != 0) {
                return status
            }
        }

        await writeStdout("Обнова прошла успешна\n")
        return 0
    } else if (args.length == 2 && args[1] == "A") {
        for (let pkg of (await listPackages())) {
            let status = await update(pkg["name"])

            if (status != 0) {
                return status
            }
        }

        await writeStdout("Обнова прошла успешна\n")
        return 0
    } else {
        await writeStdout("Использование:\n")
        await writeStdout("    ppm i <пакет> - установить пакет\n")
        await writeStdout("    ppm u <пакет> - обновить пакет\n")
        await writeStdout("    ppm r <пакет> - удалить пакет\n")
        await writeStdout("    ppm s <пакет> - показать инфу о пакете\n")
        await writeStdout("    ppm l - показать инфу о пакете\n")
        await writeStdout("    ppm a - обновить все пакеты\n")
        await writeStdout("    ppm A - обновить все пакеты принудительно\n")
    }

    return 1
}