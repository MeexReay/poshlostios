
async function main(args) {
    if (args.length != 2) {
        writeStdout(`Использование: woman <статья>

Статьи:
* apps - Создание приложений
* files - Работа файлов в приложениях
* stdin - Чтение ввода пользователя
* stdout - Вывод текста в консоль
* terminal - Работа с остальными функциями консоли
* packaging - Пакетирование приложений
* graphics - Отрисовка графики
* colors - Цвета в консоли
`)
        return 1
    }

    if (args[1] == "apps") {
        writeStdout(`# Создание приложений

## Написание программ

Все приложения в PoshlostiOS это JS скрипты
Каждый такой скрипт должен иметь свой entry-point - асинхронная функция 
  с названием main и единственным аргументом args в 
  котором хранится список из передаваемых пользователем аргументов
  и возвращающая число статус кода

Пример такого скрипта:

  async function main(args) {
      return 0
  }

## Вызов команд

Вот как выглядит функция:
  
  executeCommand(args, read=readStdin, write=writeStdout) -> {"id": string, "name": args.join(" "), "promise": Promise}

Первый аргумент при вызове команды должен быть путем до исполняемого файла
Функция возвращает промис в поле promise, чтобы дождаться конца команды используйте await
Ты чо дебик мог и сам догадаться
все бб

`)

        return 0
    } else if (args[1] == "files") {
        writeStdout(`# Работа файлов в приложениях

Вот описание всех функций для работы с файлами:

  readFile(path) -> string - читает контент файла
  writeFile(path, content) - записать контент в файл
  hasFile(path) -> boolean - узнает существует ли файл
  listFiles(path) -> list[string] - выдает список из имен файлов в папке
  createFolder(path) - создать папку
  removeFile(path) - удалить файл
  isFolder(path) -> boolean - узнает это файл или папка
  simplifyPath(path) -> string - переделать в абсолютный путь и убрать лишнее
  clearFileSystem() - удалить все файлы к чертям собачьим

Всю начинку ФС вы можете увидеть в исходном коде в sys/fs.js

`)
        return 0
    } else if (args[1] == "stdin") {
        writeStdout(`# Чтение ввода пользователя

## Редактирование флагов

  setStdinFlag(SILENT_STDIN) // Сделать чтоб при вводе не писались символы
  setStdinFlag(RENDER_STDIN) // Сделать чтобы символы при вводе обратно выводились
  setStdinFlag(DISABLE_STDIN) // Выключить ввод
  setStdinFlag(ENABLE_STDIN) // Включить ввод

## Чтение ввода сырым

Функция:

  readStdin() -> string

Она выдает всего один символ: 
Чтобы прочитать спец-клавишу, он выдает такие символы по порядку:
  
  "\\r"
  int(is_ctrl)
  int(is_alt)
  int(is_shift)
  key
  "\\r"

## Чтение ивентов с ввода

Чтобы не читать ввод сырым, вы можете читать ивентами

Функция:

  pollStdinEvent() -> event

Ивент при спец-клавише выглядит так:

  {
    "type": "key",
    "ctrl": is_ctrl,
    "alt": is_alt,
    "shift": is_shift,
    "key": key
  }

Ивент при обычном символе выглядит так:

  {
    "type": "char",
    "char": char
  }

## Чтение строками

Функция:

  readLine(on_key=(key, ctrl, alt, shift, content, pos) => [content, pos]) -> string

На спец-клавишу будет вызываться on_key, 
единственное что Backspace, ArrowLeft, ArrowRight уже обрабатываются функцией, 
и на них on_key не будет вызываться

`)
        return 0
    } else if (args[1] == "stdout") {
        writeStdout(`# Вывод текста в консоль

Функция:

  writeStdout(content)

всё

`)
        return 0
    } else if (args[1] == "terminal") {
        writeStdout(`# Работа с остальными функциями консоли

Вот функции остальные:

  getTerminal() -> string - получить контент терминала
  setTerminal(content) - изменить контент терминала
  writeTerminalAtCursor(content) - написать в терминал на курсоре
  writeTerminal(content) - написать в терминал в конец
  replaceTerminal(content) - изменить терминал и обновить
  trimTerminal(length) - обрезать терминал
  setCursor(x, y) - установить курсор
  clearTerminal() - очистить терминал
  updateTerminalWOCursor() - обновить терминал без установки курсора в конец
  updateTerminal() - обновить терминал
  updateCursor() - обновить курсор
  getCursorIndex() -> index - получить индекс курсора в тексте терминала
  getCursor() -> [x, y] - получить курсор
  getTerminalSize() -> [width, height] - получить ширину высоту терминала в символах

`)
        return 0
    } else if (args[1] == "colors") {
        writeStdout(`# Цвета в консоли

Вот как сделать обычный цвет: $#BRIGHT_RED--
Вот как сделать hex цвет: $##000000
Вот как убрать цвет: $#reset

Вот другие цвета кроме яркого красного:
* BLACK
* DARK_BLUE
* DARK_GREEN
* DARK_CYAN
* DARK_RED
* DARK_MAGENTA
* DARK_YELLOW
* DARK_WHITE
* BRIGHT_BLACK
* BRIGHT_BLUE
* BRIGHT_GREEN
* BRIGHT_CYAN
* BRIGHT_RED
* BRIGHT_MAGENTA
* BRIGHT_YELLOW
* WHITE

Чтоб вывести это в консоль как я щас сделал пиши в начале $# вместо просто доллара

Все понятно?

`)
        return 0
    } else if (args[1] == "packaging") {
        writeStdout(`# Пакетирование приложений

Пакет выглядит примерно так в репозитории (package_name для примера):

~ repository/package_name/package.json

  {
    "name": "package_name",
    "version": "0.1.0",
    "apps": [ "package_name.js" ],
    "configs": [ "package_name.json" ],

    "comment": "fields 'name', 'version', 'apps' and 'configs' are required!!! other fields can be used like this:",
    "description": "PackageDescription",
    "author": "AuthorName",
    "license": "MIT",
    "home_page": "https://example.com",
    "source_code": "https://github.com/example"
  }

~ repository/package_name/package_name.json

  {
    "config_1": "this is your config file",
    "config_2": "use it as you need",
  }

~ repository/package_name/package_name.js

  async function main(args) {
      let config = JSON.parse(readFile("/config/package_name.json")) // object

      writeStdout("here is your config file content: " + config + "\n")

      return 0
  }
  

`)
        return 0
    } else if (args[1] == "graphics") {
        writeStdout(`# Отрисовка графики

Описание использования:

  enableGraphics() // включить графику
  var graphics = getGraphics() // получить графику
  // var ctx = graphics.context // получить контекст чтоб рисоват
  // var width = graphics.width // получить ширину
  // var height = graphics.height // получить высоту
  var window = createWindow(x, y, w, h, title)
  // var width = window.width // получить ширину
  // var height = window.height // получить высоту
  // var x = window.x // получить x
  // var y = window.y // получить y
  window.move(x, y, w, h)
  // var ctx = window.context // получить контекст чтоб рисоват
  window.destroy() // удалить окно
  disableGraphics() // отключить графику

`)
        return 0
    }

    return 1
}