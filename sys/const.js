const MAX_STORAGE = 5120 * 1024 // Limit of local storage size, 5120 KB by default
const APP_REPOSITORY = "app" // Repository url to download apps from
const DEFAULT_APPS = [
    "posh", // required
    "hello",
    "ppm",
    "putils",
    "reset",
    "vget",
    "kfc",
    "woman"
]
const STARTUP_COMMAND = [ "/app/posh.js" ]
