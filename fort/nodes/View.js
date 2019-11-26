const Node = require('./Node')

module.exports = class View extends Node {
    constructor(parent, className) {
        super()
        this._type = 'View'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
