const x = require('./data/xpath')

function isTopView(app) {
    return new Promise((resolve, reject) => {
        app.hasElementByXPath(x.global.tabMovie.path, (err, has) => {
            !!err ? reject(err) : resolve(has)
        })
    }).catch(e => {
        console.log('isTopView');
        console.log(e);
        throw e
    })
}

function goBack(app) {
    return new Promise(async (resolve, reject) => {
        const isTop = await isTopView(app)
        if (!isTop) {
            app.back(err => {
                !!err ? reject(err) : resolve()
            })
        } else {
            resolve()
        }
    }).catch(e => {
        console.log('goBack');
        console.log(e);
        throw e
    })
}

async function goTopView(app) {
    while (!await isTopView(app)) {
        await goBack(app)
    }
}

function goHome(app) {
    return new Promise(async (resolve, reject) => {
        await goTopView(app)
            .catch(e => {
                console.log('goTopView');
                console.log(e);
                throw e
            })
        app
            .elementByXPath(x.global.tabMovie.path)
            .click()
            .elementByXPath(x.hotPlay.btnHotPlay.path)
            .click(err => {
                !!err ? reject(err) : resolve()
            })
    }).catch(e => {
        console.log('goHome');
        console.log(e);
        throw e
    })
}

module.exports = {
    isTopView,
    goTopView,
    goHome,
}