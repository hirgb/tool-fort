const Node = require('./Node')

module.exports = class ViewGroup extends Node {
    constructor(parent, className) {
        super()
        this._type = 'ViewGroup'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
