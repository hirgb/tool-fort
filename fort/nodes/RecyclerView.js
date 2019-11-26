const Node = require('./Node')

module.exports = class RecyclerView extends Node {
    constructor(parent, className) {
        super()
        this._type = 'RecyclerView'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
