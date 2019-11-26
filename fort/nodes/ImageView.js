const Node = require('./Node')

module.exports = class ImageView extends Node {
    constructor(parent, className) {
        super()
        this._type = 'ImageView'
        this._className = className
        this._parent = parent
    }
}
