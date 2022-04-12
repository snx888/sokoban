import CustomModel from'./CustomModel.js'

export function defineElement(options) {
    if (!options.class) options.class = class extends CustomElement {}
    options.class._attributes = options.attributes
    options.class._template = options.template || options.class._template
    if (typeof options.class._template === 'string')
        options.class._template = data => options.class._template
    options.class._data = options.data || {}
    options.class._models = options.models
    options.class._on = options.on
    options.class._el = options.el
    customElements.define(options.tag, options.class)
}

export class CustomElement extends CustomModel {
    static _models = {}
    static _attributes = []
    static _template = data => 'EMPTY TEMPLATE'
    static _on = []
    static _el = {}
    _el = {}
    _models = {}
    _modeslData = {}
    _rendered = false

    static get observedAttributes() {
        //console.log('observe attributes', this._attributes)
        return this._attributes
    }

    constructor() {
        super()
        this._models = this.constructor._models
        if (this._models) {
            const models = Object.entries(this._models)
            // prepare models to add to data @ render
            this._modelsData = models.reduce((models, [name, model]) => { 
                    models[name] = model.data
                    return models
                }, {})
            // listen to models data change events
           models.forEach(([name, model]) => {
                model.addEventListener('change', e => this._render())
                model.addEventListener('delete', e => this._render())
            })
        }
        // create shadow DOM
        this.attachShadow({mode: 'open'})
        // listen to own data change events
        this.addEventListener('change', e => this._render())
        this.addEventListener('delete', e => this._render())
    }

    connectedCallback() {
        this._render()
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        //console.log('changed:',oldValue,'->', newValue)
        this.data[name] = newValue
    }

    get models() {
        return {
            add: (name, model) => { this._models[name] = model },
            remove: (name) => { delete this._models[name] }
        }
    }
    
    _render() {
        this.shadowRoot.textContent = ''
        const template = document.createElement('template')
        template.innerHTML = this.constructor._template.bind(this)({...this._data, ...this._modelsData })
        this.shadowRoot.appendChild(template.content)
        this._setHandler()
        this._setElements()
        this._afterRender()
        this._rendered = true
    }

    _setHandler() {
        this.constructor._on &&
        this.constructor._on.forEach(on => {
            let [selector, event, handler, noBind] = on
            if (typeof selector !== 'object')
                selector = this.shadowRoot.querySelectorAll(selector)
            if (typeof selector === 'object' && selector) {
                if (!selector.forEach) selector = [selector]
                selector.forEach(s => s.addEventListener(event, noBind ? handler : handler.bind(this)))
            }
        })
    }

    _setElements() {
        if (!this.constructor._el) return
        this._el = {}
        Object.keys(this.constructor._el).forEach(key => {
            this._el[key] = this.shadowRoot.querySelector(this.constructor._el[key])
        })
    }

    _afterRender() {} //abstract

}

export default CustomElement
