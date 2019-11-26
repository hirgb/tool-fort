const {
    dc,
    server
} = require('./config')
const blocks = require('./data/blocks')
const pageTypes = require('./data/pageTypes')
const globalExclude = require('./data/exclude')
const Fort = require('../fort/fort')

start()

async function start() {
    const fort = new Fort(server, dc)
    await fort.init({
        blocks,
        pageTypes,
        globalExclude
    })
    await fort.blindTest()
    await fort.exit()
    fort.blindReport()
    console.log('All complate!')
}