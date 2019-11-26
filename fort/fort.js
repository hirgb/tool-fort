const wd = require('wd')
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const nodeMap = require('./nodeMap')
const Log = require('./Log')
const Page = require('./Page')
const CaseResult = require('./CaseResult')
const BlindResult = require('./BlindResult')
const dayjs = require('dayjs')
const fs = require('fs')

wd.addPromiseChainMethod('recordPage', function() {
    return new Promise(async (resolve, reject) => {
        const fort = this.fort
        await fort.recordPage()
        resolve()
    })
})

chai.use(chaiAsPromised)
chai.should()

chaiAsPromised.transferPromiseness = wd.transferPromiseness

class Fort {
    constructor(service, dc) {
        this._service = service
        this._dc = dc
        this._mode = ''
        this._app = wd.promiseChainRemote(service)
        this._app.fort = this
        this._caseTesting = null
        this._setting = {}
        this.xpath = null
        this.globalExclude = []
        this.pages = []
        this.unknownPageCount = 0
        this.start = null
        this.end = null
        this.blocks = []
        this.pageTypes = []
        this.isTopView = null
        this.goHome = null

        this.caseResult = new CaseResult(this)
        this.blindResult = new BlindResult(this)
    }

    get app() {
        return this._app
    }

    get mode() {
        return this._mode
    }

    init({
        blocks,
        pageTypes,
        isTopView = null,
        goHome = null,
        globalExclude = [],
        xpath = null,
        debug = false,
        save = false
    }) {
        if (!(blocks && Array.isArray(blocks) && blocks.length)) {
            Log.error('The blocks should be specified!')
            return
        }
        if (!(pageTypes && Array.isArray(pageTypes) && pageTypes.length)) {
            Log.error('The pageTypes should be specified!')
            return
        }
        this.start = dayjs()
        this.pageTypes = pageTypes
        this.blocks = blocks
        this.globalExclude = globalExclude
        this.isTopView = isTopView
        this.goHome = goHome
        this.xpath = xpath
        this._setting.debug = debug
        this._setting.save = save
        return new Promise((resolve, reject) => {
            this
                .app
                .init(this._dc, (err, status) => {
                    if (err) {
                        reject(err)
                    } else {
                        this._sessionId = status[0]
                        resolve()
                    }
                })
        }).catch(e => {
            Log.error(e)
        })
    }

    async caseTest(cases) {
        if (!this.xpath) {
            Log.error('The xpath should be specified!')
            return
        }
        if (!this.goHome) {
            Log.error('The goHome method should be specified!')
            return
        }
        if (cases && Array.isArray(cases)) {
            this._mode = 'case'
            this.caseResult.start()
            for (const c of cases) {
                if (c.name && c.info && typeof (c.handle) === 'function') {
                    this._caseTesting = {
                        name: c.name,
                        info: c.info
                    }
                    this.caseResult.totalCountCrease()
                    await this
                        .doCaseTest(c)
                        .catch(e => {
                            this._setting.debug && Log.error(e)
                        })
                }
            }
            this.caseResult.end()
        } else {
            Log.error('The param should be an array which has case element!')
        }
    }

    async singleCaseTest(cases, caseName) {
        if (cases && Array.isArray(cases)) {
            this._mode = 'case'
            this.cases = cases
            const c = cases.find(i => i.name === caseName)
            if (c) {
                await this.doCaseTest(c).catch(e => {
                    Log.error(e)
                })
            } else {
                Log.error(`Can\'t find case which named [${caseName}]`)
            }
        } else {
            Log.error('The cases is not exist.')
        }
    }

    async doCaseTest(c) {
        Log.info(`Testing > ${c.name} - ${c.info}`)
        await this.goHome(this.app)
        return new Promise((resolve, reject) => {
            const app = this.app
            const handle = c.handle
            const t = this.testHandler(reject)
            const e = this.exitHandler(resolve, reject)
            app
                .attach(this._sessionId, err => {
                    if (err) {
                        throw err
                    } else {
                        handle(app, t, e)
                    }
                })
        })
    }

    async blindTest() {
        if (!this.isTopView) {
            Log.error('The blind test mode should specified a isTopView method')
            await this.exit()
            return
        }
        const blocks = this.blocks
        this._mode = 'blind'
        for (const block of blocks) {
            await this.iterateBlock(block)
        }
    }

    async singleBlockTest(index) {
        if (!this.isTopView) {
            Log.error('The blind test mode should specified a isTopView method')
            await this.exit()
            return
        }
        let block = null
        if (typeof (index) === 'number') {
            block = this.blocks[index]
        }
        if (typeof (index) === 'string') {
            block = this.blocks.find(i => i.id === index)
        }
        if (!block) {
            Log.error('The block object is null. Please check the block flag!')
            await this.exit()
            return
        }
        await this.iterateBlock(block)
    }

    async iterateBlock(block) {
        const app = this.app
        await block.entry(app)
        await this.iteratePage()
    }

    async iteratePage() {
        // 返回值： 0：未知页面类型；1：未遍历完成；2：已遍历完成
        let complate = false
        do {
            const pageInfo = await this.getPageInfo()
            const page = await this.buildPage(pageInfo)
            // 在当前页面点击一个未点击的元素
            const clickResult = await page.clickAUnclickedEl()
            if (clickResult === 1) { // 按照预期点击了一个未点击的元素
                const tempPageInfo = await this.getPageInfo()
                if (tempPageInfo && tempPageInfo.name) {
                    if (tempPageInfo.name !== pageInfo.name) {
                        await this.iteratePage()
                        await this.goBack()
                    }
                } else {
                    this.unknownPageCount++
                    Log.warn('Unregiste page type')
                    await this.goBack()
                }
            } else if (clickResult === 2) { // 当前页面所有可点击元素已经全部点击
                Log.success(`Page iterated complate [${pageInfo.name}]`)
                complate = true
            }
        } while (!complate);
    }

    async getPageInfo() {
        const app = this.app
        const pageTypes = this.pageTypes
        let pageInfo = null;
        for (const p of pageTypes) {
            if (await p.is(app)) {
                pageInfo = p;
                break;
            }
        }
        return pageInfo
    }

    async recordPage() {
        const page = await this.getPageInfo()
        this.caseResult.addRelativePage(page)
    }

    testHandler(reject) {
        this.caseResult.elCountCrease()
        return err => {
            if (err) {
                this.errorHandler(err)
                reject(err)
            }
        }
    }

    exitHandler(resolve, reject) {
        return err => {
            if (err) {
                this.errorHandler(err)
                reject(err)
            } else {
                this.caseResult.successCountCrease()
                resolve()
            }
        }
    }

    errorHandler(err) {
        this.caseResult.failedCountCrease()
        const status = parseInt(err['status'])
        const message = err['message']
        const summary = err['jsonwire-error']['summary']
        let errorMsg = ''
        if (status === 7) {
            const path = this.__xpathExtractor(message)
            if (path) {
                const elName = this.__findXpathName(path)
                if (elName) {
                    errorMsg = elName + ' - ' + summary
                } else {
                    errorMsg = path.replace(/\\/g, '') + ' - ' + summary
                }
            } else {
                errorMsg = message
            }
        } else {
            errorMsg = message
        }
        Log.error(errorMsg)
        this._caseTesting.errorMsg = errorMsg
        this.caseResult.addFailedCase(this._caseTesting)
        this._caseTesting = null
    }

    __xpathExtractor(message) {
        const m = message.match(/\(.*\)/)
        if (m.length === 1) {
            return m[0].slice(2, -2).replace(/\\/g, '')
        } else {
            return null
        }
    }

    __findXpathName(path) {
        const x = this.xpath
        let pathObj = null
        for (const pageKey in x) {
            if (x.hasOwnProperty(pageKey)) {
                const page = x[pageKey];
                for (const pathKey in page) {
                    if (page.hasOwnProperty(pathKey)) {
                        if (page[pathKey] && page[pathKey].path === path) {
                            pathObj = page[pathKey];
                        }
                    }
                }
            }
        }
        if (pathObj && pathObj.name) {
            return pathObj.name
        } else {
            return null
        }
    }

    exit() {
        return new Promise((resolve, reject) => {
            const app = this.app
            this.end = dayjs()
            this.exec(() => {
                app.quit(err => {
                    !!err ? reject(err) : resolve()
                })
            })
        }).catch(e => {
            throw e
        })
    }

    goBack() {
        return new Promise(async (resolve, reject) => {
            const app = this.app
            if (!await this.isTopView(app)) {
                app.back(err => {
                    !!err ? reject(err) : resolve()
                })
            } else {
                resolve()
            }
        }).catch(e => {
            Log.error(e)
        })
    }

    caseReport() {
        this.caseResult.report()
    }

    blindReport() {
        const totalTime = dayjs(this.end).diff(this.start, 'minute', true)
        let elCount = 0
        let elCountClicked = 0
        let elCountError = 0
        let elError = []

        this.pages.forEach(p => {
            p.nodeClickable.forEach(n => {
                elCount++
                n.clicked && elCountClicked++
                if (n.error) {
                    elCountError++
                    elError.push(n.error)
                }
            })
        })

        const result = `

${'-'.repeat(30) + ' BLIND TEST REPORT ' + '-'.repeat(30)}
总耗时: ${Number(totalTime).toFixed(2)} min

${'-'.repeat(2) + '页面' + '-'.repeat(2)}
  检测页面数量: ${this.pages.length}，[${this.pages.map(i => i.name).join('，')}]
  未注册页面数量（累加值）: ${this.unknownPageCount}

${'-'.repeat(2) + '元素' + '-'.repeat(2)}
  可点击元素总数: ${elCount}
  检测数量: ${elCountClicked}
  检测占比: ${Number(elCountClicked / elCount * 100).toFixed(2)}%
  错误数量: ${elCountError}
  错误占比: ${Number(elCountError / elCountClicked * 100).toFixed(2)}%
  错误列表: ${JSON.stringify(elError, null, 4)}
${'-'.repeat(60 + ' BLIND TEST REPORT '.length)}
`
        console.log(result);
        fs.writeFileSync(`blind-test-report-${dayjs().format()}.html`, '<pre>' + result)
    }

    exec(cb) {
        return new Promise((resolve, reject) => {
            this
                .app
                .attach(this._sessionId, async (err) => {
                    if (err) {
                        throw err
                    } else {
                        await cb(this.app)
                    }
                })
        })
    }

    async buildPage(pageInfo) {
        const app = this.app
        Log.info(`Current page [${pageInfo.name}]`)
        const start = dayjs()
        const pages = this.pages
        let page = pages.find(i => i.name === pageInfo.name)
        if (!page) {
            Log.info(`Start build page [${pageInfo.name}]`)
            page = new Page(pageInfo, app, this.globalExclude)
            await this.fillNode(page.root, page)
            pages.push(page)
            const end = dayjs()
            const diff = dayjs(end).diff(start, 'minute', true)
            Log.success(`Page build success [${pageInfo.name}]. Total Time [${Number(diff).toFixed(2)}] minutes.`)
        }
        return page
    }

    fillNode(node, page) {
        // 这是一个递归方法。之前用的方法时在每一个子节点创建时马上填充此节点。但是这种方法
        // 有个缺陷，就是xpath的形成需要在所有子节点全部创建完成后才能确定，否则是不准确的。
        return new Promise(async (resolve, reject) => {
            const xpath = this.genXpath(node)
            // Log.info('PARENT NODE XPATH : ' + xpath)
            const childrenCount = await this.getElChildrenCount(xpath)
            for (let i = 0; i < childrenCount; i++) {
                const el = await this.getElChild(xpath, i)
                const nodeAttr = await this.getElAttribute(el)
                const className = nodeAttr.className
                Log.info(page.nodeCount + ' : ' + className)
                const nodeType = className.split('.').slice(-1)[0]
                if (nodeType in nodeMap) {
                    const child = new nodeMap[nodeType](node, className)
                    child.clickable = nodeAttr.clickable
                    node.children.push(child)
                    child.clickable && page.nodeClickable.push(child)
                    page.nodeCountCrease(child)
                } else {
                    const msg = `There is an unknown node type: ${nodeType}`
                    Log.error(msg)
                    throw new Error(msg)
                }
            }
            for (let i = 0; i < childrenCount; i++) {
                if (!node.children[i].clickable) { // 优化：如果一个节点能被点击，则不用再探测它的子节点了
                    await this.fillNode(node.children[i], page)
                } else {
                    this.genXpath(node.children[i])
                }
            }
            resolve()
        }).catch(e => {
            Log.error(e)
        })
    }

    genXpath(node) {
        let xpath = []
        let n = node
        while (n.parent) {
            let same = n.parent.children.filter(i => i.type === n.type)
            if (same.length > 1) {
                let index = same.findIndex(i => i === n)
                xpath.unshift(`${n.className}[${index + 1}]`)
            } else {
                xpath.unshift(`${n.className}`)
            }
            n = n.parent
        }
        xpath.unshift(n.className)
        xpath.unshift('hierarchy')
        const result = `/${xpath.join('/')}`.replace(/\$/g, '.')
        node.xpath = result
        return node.xpath
    }

    getElChildrenCount(xpath) {
        return new Promise((resolve, reject) => {
            this
                .app
                .elementsByXPath(`${xpath}/*`, (err, els) => {
                    !!err ? reject() : resolve(els.length)
                })
        }).catch(e => {
            Log.error(e)
        })
    }

    getElChild(xpath, i) {
        return new Promise((resolve, reject) => {
            this
                .app
                .elementsByXPath(`${xpath}/*`, (err, els) => {
                    !!err ? reject() : resolve(els[i])
                })
        }).catch(e => {
            Log.error(e)
        })
    }

    getElAttribute(el) {
        return new Promise((resolve, reject) => {
            let attr = {
                className: '',
                clickable: false
            }
            el
                .getAttribute('class', (err, value) => {
                    !!err ? reject() : (attr.className = value)
                })
                .getAttribute('clickable', (err, value) => {
                    if (err) {
                        reject()
                    } else {
                        attr.clickable = (value === 'true' ? true : false)
                        resolve(attr)
                    }
                })
        }).catch(e => {
            Log.error(e)
        })
    }

    getPageSync(pageName) {
        const pages = this.pages
        return pages.find(i => i.name === pageName)
    }

    clickAUnclickedEl(pageName) {
        return new Promise(async (resolve, reject) => {
            const page = this.getPageSync(pageName)
            if (page) {
                resolve(await page.clickAUnclickedEl(this.app))
            } else {
                reject('The page is not exist.')
            }
        }).catch(e => {
            Log.error(e)
        })
    }
}

module.exports = Fort