const Node = require('./Node')

module.exports = class RatingBar extends Node {
    constructor(parent, className) {
        super()
        this._type = 'RatingBar'
        this._className = className
        this._parent = parent
    }
}
