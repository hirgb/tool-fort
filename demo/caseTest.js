// node caseTest.js

const {
    server,
    dc
} = require('./config')
const fs = require('fs')
const path = require('path')
const blocks = require('./data/blocks')
const pageTypes = require('./data/pageTypes')
const xpath = require('./data/xpath')
const {
    goHome
} = require('./utils')
const args = require('minimist')(process.argv.slice(2))
const Fort = require('../fort/fort')

const target = args.file
const targetPath = path.resolve('data', target)
if (fs.existsSync(targetPath)) {
    start(target)
} else {
    console.log(`The case file is not exist. [${targetPath}]`);
}


async function start(target) {
    const cases = require(`./data/${target}`)
    const fort = new Fort(server, dc)
    await fort.init({
        blocks,
        pageTypes,
        xpath,
        goHome,
        debug: args.d,
        save: args.s
    })
    await fort.caseTest(cases)
    await fort.exit()
    fort.caseReport()
}