const {
    isTopView,
    goTopView,
} = require('../utils')

const {
    promiser
} = require('../../fort/utils')

const x = require('./xpath')

module.exports = [{
    id: 'movie',
    name: '电影',
    is: promiser(async (resolve, reject, app) => {
        if (await isTopView(app)) {
            app.elementByXPath(x.tabMovie)
                .getAttribute('selected', (err, value) => {
                    !!err ? reject(err) : resolve(value === 'true');
                });
        } else {
            resolve(false);
        }
    }),
    entry: promiser(async (resolve, reject, app) => {
        await goTopView(app)
        app
            .elementByXPath(x.tabMovie)
            .click()
            .elementByXPath(x.btnCurrentPlay)
            .click(err => {
                !!err ? reject(err) : resolve()
            })
    })
}]