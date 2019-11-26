const Node = require('./Node')

module.exports = class WebView extends Node {
    constructor(parent, className) {
        super()
        this._type = 'WebView'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
