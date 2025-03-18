/*

    PPM - Poshliy Package Manager

*/

async function main(args) {
    if (args.length == 3 && "iurs".includes(args[1])) {
        let package = args[2]

        if (args[1] == "i") {
            let config = JSON.parse(readFile("/config/ppm.json"))

            for (const repo of config["repositories"]) {
                // await writeStdout(`Фетчим ${package} на репозитории ${repo}\n`)

                let status = await installPackage(repo+"/"+package)

                if (status == 0) {
                    let pkg = await getInstalledPackage(package)
                    await writeStdout(`Пакет ${pkg['name']}-${pkg['version']} установлен\n`)
                    return 0
                } else if (status == 1) {
                    await writeStdout("Пакет не установлен тк он уже установлен чувааак\n")
                    return 1
                }
            }
        } else if (args[1] == "u") {
            let config = JSON.parse(readFile("/config/ppm.json"))

            for (const repo of config["repositories"]) {
                let status = await updatePackage(package, repo+"/"+package)

                if (status == 0) {
                    let pkg = await getInstalledPackage(package)
                    await writeStdout(`Пакет ${pkg['name']}-${pkg['version']} обновлен\n`)
                    return 0
                } else if (status == 1) {
                    await writeStdout("Пакет не найден ты его установи сначала чел\n")
                    return 1
                }
            }

            await writeStdout("обнова не прошла успешна\n")
            return 1
        } else if (args[1] == "r") {
            if (await removePackage(package)) {
                await writeStdout(`Пакет ${package} удален\n`)
            } else {
                await writeStdout("Биспокойся произошла ошибко\n")
                return 1
            }
        } else if (args[1] == "s") {
            let pkg = await getInstalledPackage(package)
            for (const [key, value] of Object.entries(pkg)) {
                await writeStdout(key.charAt(0).toUpperCase()+key.slice(1)+": "+value+"\n")
            }
        }
    } else if (args.length == 2 && args[1] == "l") {
        await writeStdout("ваши покеты:\n")
        for (const package of (await listPackages())) {
            await writeStdout("- "+package["name"]+"-"+package["version"]+"\n")
        }        
    } else if (args.length == 2 && args[1] == "a") {
        let config = JSON.parse(readFile("/config/ppm.json"))

        for (const package of (await listPackages())) {
            for (const repo of config["repositories"]) {
                // await writeStdout(`Фетчим ${package["name"]} на репозитории ${repo}\n`)

                let fetched = await fetchPackage(repo+"/"+package["name"])
                if (fetched != null) {
                    if (fetched["version"] == package["version"]) {
                        await writeStdout(`Пакет ${package['name']}-${package['version']} уже на последней версии\n`)
                        break
                    }
                    
                    let status = await updatePackage(package["name"], repo+"/"+package["name"])

                    if (status == 0) {
                        let pkg = await getInstalledPackage(package["name"])
                        await writeStdout(`Пакет ${pkg['name']}-${pkg['version']} обновлен\n`)
                        break
                    } else if (status == 1) {
                        break
                    }
                }
            }
        }

        await writeStdout("Обнова прошла успешна\n")
        return 0
    } else if (args.length == 2 && args[1] == "A") {
        let config = JSON.parse(readFile("/config/ppm.json"))

        for (const package of (await listPackages())) {
            for (const repo of config["repositories"]) {
                let status = await updatePackage(package["name"], repo+"/"+package["name"])

                if (status == 0) {
                    let pkg = await getInstalledPackage(package["name"])
                    await writeStdout(`Пакет ${pkg['name']}-${pkg['version']} обновлен\n`)
                    break
                } else{
                    console.log(status, repo, package)
                }
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

    return 0
}