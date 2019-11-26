const x = require('./xpath');

const case11 = {
    name: 'case1',
    info: '检查页面1',
    handle: (app, t, e) => {
        app
            .elementByXPath(x.hotPlay.btnHotPlay.path, t)
            .click(e)
    }
}

module.exports = [
    case1
]