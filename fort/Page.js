const Log = require('./Log')
const nodeMap = require('./nodeMap')

module.exports = class Page {
    constructor(pageInfo, app, globalExclude = []) {
        this._app = app
        this.root = new nodeMap['FrameLayout'](null, 'android.widget.FrameLayout')
        this.name = pageInfo.name
        this.level = pageInfo.level
        this.is = pageInfo.is
        this.entry = pageInfo.entry
        this.exclude = (pageInfo.exclude && Array.isArray(pageInfo.exclude))
            ? [...pageInfo.exclude, ...globalExclude]
            : [...globalExclude]
        this.nodeClickable = []
        this._nodeCount = 0
        this._nodeCountClickable = 0
        this._nodeTypeCount = {}
    }

    get nodeCount() {
        return this._nodeCount
    }

    get nodeCountClickable() {
        return this._nodeCountClickable
    }

    nodeCountCrease(node) {
        this._nodeCount++
        if (node.clickable) {
            this._nodeCountClickable++
        }
        if (node.type in this._nodeTypeCount) {
            this._nodeTypeCount[node.type]++
        } else {
            this._nodeTypeCount[node.type] = 1
        }
    }

    clickAUnclickedEl() {
        const app = this._app
        const exclude = this.exclude
        // 1: 执行成功；2: 本页可点击元素已经全部点击过
        return new Promise((resolve, reject) => {
            let els = this.nodeClickable.filter(i => !i.clicked)
            if (els.length) {
                let el = els[0]
                let xpath = el.xpath
                let excludeNode = exclude.find(i => xpath.startsWith(i.xpath))
                if (excludeNode) {
                    el.clicked = true
                    el.error = {
                        message: '预置为不可点击',
                        info: excludeNode,
                        xpath: el.xpath
                    }
                    resolve(1)
                } else {
                    el.clicked = true
                    if (el.type === 'EditText') {
                        app
                        .elementByXPath(el.xpath, err => {
                            if (err) {
                                el.error = err
                                reject(err)
                            }
                        })
                        .click(err => {
                            !!err && reject(err)
                        })
                        .back(err => {
                            !!err ? reject(err) : resolve(1)
                        })
                    } else {
                        app
                        .elementByXPath(el.xpath, err => {
                            if (err) {
                                el.error = err
                                reject(err)
                            }
                        })
                        .click(err => {
                            !!err ? reject(err) : resolve(1)
                        })
                    }
                }
            } else {
                resolve(2)
            }
        }).catch(e => {
            Log.error(e)
            return 1
        })
    }
}
