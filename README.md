# Android应用UI测试框架

## 测试原理
- 元素遍历测试。可以将整个app看作由一个或多个模块(block)组成的组件树，每个顶层视图中tab是模块或者组件树的入口。
我们可以对每个组件树进行遍历，检测异常情况。
- case测试。编写case文件，对case文件中的每个case逐个测试。每个case由一系列元素选择、点击动作组成，在执行过程中，
可以对特定UI界面进行判断，从而判断是否进入预期界面。

## 环境准备
- java sdk
- android sdk
- appium
- appium-doctor
- nodejs
- wd.js

## 快速上手

- 配置server 及 dc

```js
module.exports = {
    dc: {
        deviceName: "PAFM00",
        noReset: true,
        platformName: "Android",
        platformVersion: "9",
        newCommandTimeout: 0,
        connectHardwareKeyboard: true
    },
    server: 'http://localhost:4723/wd/hub'
}
```

- 提供 模块定义 及 页面定义
  - 模块定义

```js
const {
    isTopView,
    goTopView,
    promiser
} = require('../utils/utils')

const x = require('./xpath')

module.exports = [
    {
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
    },
    ...
]
```

  - 页面定义

```js
const {
    isTopView,
    goBack,
    promiser,
    genXpathFromText
} = require('../utils/utils')

const x = require('./xpath')

module.exports = [
    {
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
        exclude: [
            {
                name: '电影页tab栏',
                xpath: '/hierarchy/.../android.view.ViewGroup[2]'
            }
        ]
    },
    ...
]
```

- 盲测（示例代码）

```js
const {dc, server} = require('./config')
const blocks = require('./data/blocks')
const pageTypes = require('./data/pageTypes')
const Fort = require('./fort/fort')

start()

async function start() {
    const fort = new Fort(server, dc)
    await fort.init({
        blocks,
        pageTypes,
        isTopView,
        xpath,
        globalExclude,
        debug,
        save
    })
    await fort.blindTest()
    await fort.exit()
    fort.blindReport()
    console.log('All complate!')
}
```

- case测试（示例代码，须提供case用例）

```js
const {
    server,
    dc
} = require('./config')
const blocks = require('./data/blocks')
const pageTypes = require('./data/pageTypes')
const Fort = require('./fort/fort')
const cases = require('./cases')

start()

async function start() {
    const fort = new Fort(server, dc)
    await fort.init({
        blocks,
        pageTypes,
        isTopView,
        xpath,
        globalExclude,
        debug,
        save
    })
    await fort.caseTest(cases)
    await fort.exit()
    fort.caseReport()
}
```

- case用例

```js
const x = require('./xpath')
const case1 = {
    name: 'case1',
    info: '检查主界面的显示',
    handle: (app, t, e) => {
        app
            .elementByXPath(x.titleApp, t)
            .elementByXPath(x.tabMovie, t)
            .click(t)
            .elementByXPath(x.itemCurrentPlay, t)
    }
}
module.exports = [
    case1
]
```

- 其他

配置全局排除元素（以元素中xpath开头的元素将不会被遍历，只影响盲测）

```js
fort.init({
        globalExclude
    })
```
exclude.js文件示例

```js
const x = require('./xpath')

module.exports = [
    {
        name: '全局返回按钮',
        xpath: x.btnBack
    },
    {
        name: '全局模块按钮',
        xpath: x.layoutBlockBar
    },
]
```

xpath.js文件示例

```js
module.exports = {
    global: {
        tabMovie: {
            name: '',
            path: '',
        }
    }
    ...
}
```