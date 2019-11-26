const Node = require('./Node')

module.exports = class ScrollView extends Node {
    constructor(parent, className) {
        super()
        this._type = 'ScrollView'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
