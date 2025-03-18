async function main(args) {
    await writeStdout("Ты уверен, что хочешь стереть систему, и установить снова?? (y/n) > ")
    let confirm = (await readLine()).toLowerCase() == "y"
    if (confirm) { 
        await new Promise(r => setTimeout(r, 100));
        await writeStdout("Прощай...")
        await new Promise(r => setTimeout(r, 2000));
        await resetSystem()
        document.location.reload()
        for (const c of Array.from("\nвелосипе")) {
            await writeStdout(c)
            await new Promise(r => setTimeout(r, 30));
        }
        await new Promise(r => setTimeout(r, 999999));
    }

    return 0
}