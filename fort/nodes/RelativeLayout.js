const Node = require('./Node')

module.exports = class RelativeLayout extends Node {
    constructor(parent, className) {
        super()
        this._type = 'RelativeLayout'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
