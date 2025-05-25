eval(readFile("/app/zcom.js"))

const HELP_MESSAGE = `Помощь по MXWM:

Выключить оконный менеджер - Alt+Shift+Q
Создать новое окно ZTERM - Alt+Enter
Закрыть окно - Alt+Shift+C
Переместить окно - Зажмите мышкой на заголовке окна 
ИЛИ Нажмите Alt и зажмите левой кнопки мышки на окне
Изменить размер окна - Зажмите мышкой на 
правом нижнем углу окна 
ИЛИ Нажмите Alt и зажмите правой кнопки мышки на окне`

let run = true

function draw(ctx) {
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.font = "bold 14px terminus";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = "black";

    let y = 0
    for (let line of HELP_MESSAGE.split("\n").reverse()) {
        ctx.fillText(line, 10, ctx.canvas.height - 10 - y);
        y += 18
    }
}

async function main(args) {
    let [wid, ctx] = createWindow({ 
        "title": "help page",
        "app_id": "zhelp",
        "x": 50,
        "y": 50,
        "width": 420,
        "height": 184,
        "onresize": () => {
            draw(ctx)
        },
        "onsignal": (s) => {
            if (s == 9) run = false;
        },
        "resizable": false
    })

    draw(ctx)

    while (run && graphics_canvas != null) {
        await new Promise(resolve => setTimeout(resolve, 100))
        draw(ctx)
    }

    closeWindow(wid)
    
    return 0
}
