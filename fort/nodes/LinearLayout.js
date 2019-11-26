const Node = require('./Node')

module.exports = class LinearLayout extends Node {
    constructor(parent, className) {
        super()
        this._type = 'LinearLayout'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
