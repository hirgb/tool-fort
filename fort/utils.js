const Log = require('../fort/Log')

function promiser(fn) {
    return (obj) => {
        return new Promise((resolve, reject) => {
            fn(resolve, reject, obj)
        }).catch(e => {
            Log.error(e)
        })
    }
}

function genXpathFromText(str) {
    return `//android.view.View[@content-desc="${str}"]`
}

function genXpathFromTextInArray(str, index) {
    return `(//android.view.View[@content-desc="${str}"])[${index}]`
}

module.exports = {
    promiser,
    genXpathFromText,
    genXpathFromTextInArray,
}
