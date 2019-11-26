const Node = require('./Node')

module.exports = class ActionBar$Tab extends Node {
    constructor(parent, className) {
        super()
        this._type = 'ActionBar.Tab'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
