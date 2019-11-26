const Node = require('./Node')

module.exports = class Image extends Node {
    constructor(parent, className) {
        super()
        this._type = 'Image'
        this._className = className
        this._parent = parent
    }
}
