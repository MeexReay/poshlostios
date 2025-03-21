/*

    Hello message

*/

const message = `Приветствуем в PoshlostiOS!!!!

Github - https://github.com/MeexReay/poshlostios

Стандартные komandi:
* cd <dir> - перемещение по папкам
* hello - эт кодмана
* ls [dir] - посмотреть список файлов
* meow <text> - чтото пробормотать
* posh [command] - типа херня которая команды обрабатывает
* vget <url> <file> - скачать файлы из интернетов
* clear - стереть терминал
* rm <file> - удалить файл
* mv <src> <dest> - переместить файл
* bump <file> - создать файл
* cp <src> <dest> - скопировать файл
* mkdir <dir> - создать папку
* reset - УНИЧТОЖИТЬ СИСТЕМУ, и установить заново :3
* cat <file> - показать содержимое файла
* ppm <i/s/r/u/A/a/l> [package] - пакетный менеджер
* woman <article> - руководства по всякому
* kfc <file> - редактор файлов в стиле vi

Планируется:
* xorg
`

async function main(args) {
    writeStdout(message)
    return 0
}