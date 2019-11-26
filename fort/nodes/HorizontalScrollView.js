const Node = require('./Node')

module.exports = class HorizontalScrollView extends Node {
    constructor(parent, className) {
        super()
        this._type = 'HorizontalScrollView'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
