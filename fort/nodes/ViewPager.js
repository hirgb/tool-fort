const Node = require('./Node')

module.exports = class ViewPager extends Node {
    constructor(parent, className) {
        super()
        this._type = 'ViewPager'
        this._className = className
        this._children = []
        this._parent = parent
    }
}
