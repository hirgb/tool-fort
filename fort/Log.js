require('colors')

module.exports = class Log {
    constructor() {

    }

    static error(str) {
        console.log('[Error]: '.red + str)
    }

    static info(str) {
        console.log('[Info]: '.gray + str)
    }

    static success(str) {
        console.log('[Success]: '.green + str)
    }

    static warn(str) {
        console.log('[Warn]: '.yellow + str)
    }
}
