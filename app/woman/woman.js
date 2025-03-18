
async function main(args) {
    if (args.length != 2) {
        writeStdout(`Использование: woman <статья>

Статьи:
* apps - Создание приложений
* files - Работа файлов в приложениях
* stdin - Чтение ввода пользователя
* stdout - Вывод текста в консоль
* cursor - Работа с курсором
* packaging - Пакетирование приложений
`)
        return 1
    }

    if (args[0] == "apps") {
        writeStdout(`# Создание приложений

Все приложения в PoshlostiOS это JS скрипты
Каждый такой скрипт должен иметь свой entry-point - асинхронная функция 
  с названием main и единственным аргументом args в 
  котором хранится список из передаваемых пользователем аргументов
  и возвращающая число статус кода

Пример такого скрипта:

  async function main(args) {
      return 0
  }

Читайте также:
* files - Работа файлов в приложениях
* stdin - Чтение ввода пользователя
* stdout - Вывод текста в консоль
* cursor - Работа с курсором
* packaging - Пакетирование приложений

`)

        return 0
    } else if (args[0] == "files") {
        writeStdout(`# Работа файлов в приложениях

Статья в разработке

`)
        return 0
    } else if (args[0] == "stdin") {
        writeStdout(`# Чтение ввода пользователя

Статья в разработке

`)
        return 0
    } else if (args[0] == "stdout") {
        writeStdout(`# Вывод текста в консоль

Статья в разработке

`)
        return 0
    } else if (args[0] == "cursor") {
        writeStdout(`# Работа с курсором

Статья в разработке

`)
        return 0
    }if (args[0] == "packaging") {
        writeStdout(`# Пакетирование приложений

Статья в разработке

`)
        return 0
    }

    return 1
}