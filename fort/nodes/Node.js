module.exports = class Node {
    constructor() {
        this._type = 'base'
        this.clickable = false
        this.clicked = false
        this.xpath = ''
        this.error = null
    }

    get type() {
        return this._type
    }

    get className() {
        return this._className
    }

    get parent() {
        return this._parent
    }

    get children() {
        return this._children
    }
}
