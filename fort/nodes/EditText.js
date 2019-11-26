const Node = require('./Node')

module.exports = class EditText extends Node {
    constructor(parent, className) {
        super()
        this._type = 'EditText'
        this._className = className
        this._parent = parent
    }
}
