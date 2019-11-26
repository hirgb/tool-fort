const fs = require('fs')
const dayjs = require('dayjs')

module.exports = class CaseResult {
    constructor(parent) {
        this.parent = parent
        this.relativePages = new Set()
        this.relativeNodes = []
        this.failedCase = []
        this.elCount = 0
        this.successCount = 0
        this.failedCount = 0
        this.totalCount = 0
    }

    start() {
        this.startTime = dayjs()
    }

    end() {
        this.endTime = dayjs()

    }

    totalCountCrease() {
        this.totalCount++
    }

    successCountCrease() {
        this.successCount++
    }

    failedCountCrease() {
        this.failedCount++
    }

    elCountCrease() {
        this.elCount++
    }

    addFailedCase(caseObj) {
        this.failedCase.push(caseObj)
    }

    addRelativePage(page) {
        if (page) {
            this.relativePages.add(page.name)
        }
    }

    report() {
        const setting = this.parent._setting
        const save = !!setting.save
        const totalTime = dayjs(this.endTime).diff(this.startTime, 'minute', true)
        const result = `

${'-'.repeat(30) + ' CASE TEST REPORT ' + '-'.repeat(30)}
手机型号: ${this.parent._dc.deviceName}
系统版本: ${this.parent._dc.platformName + ' ' + this.parent._dc.platformVersion}
总耗时: ${Number(totalTime).toFixed(2)} min

${'-'.repeat(2) + '元素' + '-'.repeat(2)}
    检测元素数量: ${this.elCount}

${'-'.repeat(2) + 'CASE' + '-'.repeat(2)}
    检测总数: ${this.totalCount}
    成功数量: ${this.successCount}
    失败数量: ${this.failedCount}
    错误占比: ${Number(this.failedCount / this.totalCount * 100).toFixed(2)}%
    错误列表: ${JSON.stringify(this.failedCase, null, 4)}
${'-'.repeat(60 + ' CASE TEST REPORT '.length)}
        `
        console.log(result)
        save && fs.writeFileSync(`case-test-report-${dayjs().format()}.html`, '<pre>' + result)
    }
}