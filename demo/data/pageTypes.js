const {
    promiser,
    genXpathFromText
} = require('../../fort/utils')

const {
    isTopView,
    goBack
} = require('../utils')

const x = require('./xpath')

const isPageMovie = promiser(async (resolve, reject, app) => {
    if (await isTopView(app)) {
        app.elementByXPath(x.global.tabMovie.path)
            .getAttribute('selected', (err, value) => {
                !!err ? reject(err) : resolve(value === 'true');
            });
    } else {
        resolve(false);
    }
})

const goPageMovie = promiser(async (resolve, reject, app) => {
    while (!await isTopView(app)) {
        await goBack(app);
    }
    app.elementByXPath(x.global.tabMovie.path)
        .click(err => {
            !!err ? reject(err) : resolve();
        });
})

module.exports = [{
    id: 'movie',
    name: '电影',
    level: 1,
    is: promiser(async (resolve, reject, app) => {
        resolve(await isPageMovie(app))
    }),
    entry: promiser(async (resolve, reject, app) => {
        await goPageMovie(app)
        resolve()
    }),
    exclude: [{
        name: '电影页tab栏',
        xpath: '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.RelativeLayout/android.view.ViewGroup[2]'
    }]
}]