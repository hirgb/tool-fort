const Node = require('./Node')

module.exports = class FrameLayout extends Node {
    constructor(parent, className) {
        super()
        this._type = 'FrameLayout'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
