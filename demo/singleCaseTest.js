// node singleCaseTest.js --file=   --name=

const {
    server,
    dc
} = require('./config')
const {
    goHome
} = require('./utils')
const xpath = require('./data/xpath')
const fs = require('fs')
const path = require('path')
const args = require('minimist')(process.argv.slice(2))
const blocks = require('./data/blocks')
const pageTypes = require('./data/pageTypes')
const Fort = require('../fort/fort')
const file = args.file
const name = args.name
if (file && name) {
    const filePath = path.resolve('data', file)
    if (fs.existsSync(filePath)) {
        const cases = require('./data/' + file)
        start(cases, name)
    } else {
        console.log(`The case file is not exist. [${targetPath}]`);
    }
} else {
    console.log('Please specify the case file and case name.')
}

async function start(cases, name) {
    const fort = new Fort(server, dc)
    await fort.init({
        blocks,
        pageTypes,
        xpath,
        goHome,
    })
    await fort.singleCaseTest(cases, name)
    await fort.exit()
    fort.caseReport()
}