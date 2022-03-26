
let count = 0
export function defineModel(options) {
    if (!options.data) options = { data: options }
    if (!options.class) options.class = class extends CustomModel {}
    if (!options.tag) options.tag = 'custom-model-' + count++
    options.class._data = options.data
    customElements.define(options.tag, options.class)
    //console.log(options)
    return options.tag
}

export function createModel(options) {
    // create model by name or defineModel()
    return document.createElement(
        typeof options === 'string' 
        ? options 
        : defineModel(options))
}

export class CustomModel extends HTMLElement {
    static _data = {}
    _data = {}

    constructor() {
        super()
        this._data = new Proxy(this.constructor._data, this._handler('data'))
        //this._data = this.constructor._data.PROXY ? this.constructor._data : new Proxy(this.constructor._data, this._handler('data'))
        //console.log(this.constructor._data, this._data)
    }

    // if data gets completly modified from out outside (e.g. <component>.data = { ... })
    get data() {
        return this._data
    }
    set data(v) {
        const old = this._data
        this._data = v.PROXY ? v : new Proxy(v, this._handler('data'))
        this._emit(new CustomEvent('change'), {
            name: 'data',
            path: '',
            fullname: 'data',
            oldValue: old,
            newValue: this._data
        })
    }

    _handler(path) {
        const THIS = this
        return {
            get (o,p) {
                //console.log(typeof o[p])
                //console.log("get",o,p)
                // if the accessed property is an object or array,
                // create an proxy around..
                /*if (['[object Object]', '[object Array]'].indexOf(Object.prototype.toString.call(o[p])) > -1) {
                    return new Proxy(o[p], THIS._handler())
                }*/
                // the above code would create a new proxy at each get request !
                if (p === 'PROXY') return 'CustomModel'
                if (typeof o[p] === 'object' && !o[p].PROXY) {
                    //console.log("new proxy for", p, o, o[p])
                    o[p] = new Proxy(o[p], THIS._handler(path+'.'+p))
                }
                return o[p]
            },
            set (o,p,v) {
                //console.log("set",o,p,v)
                // return if there was no change
                if (o[p] === v) return true
                const old = o[p]
                o[p] = v
                THIS._emit(new CustomEvent('change', { detail: {
                    name: p,
                    path: path,
                    fullname: path+'.'+p,
                    oldValue: old,
                    newValue: v
                }}))
                return true
            },
            deleteProperty (o,p) {
                const old = o[p]
                delete o[p]
                THIS._emit(new CustomEvent('delete', { detail: {
                    name: p,
                    path: path,
                    fullname: path+'.'+p,
                    oldValue: old,
                    newValue: undefined
                }}))
                return true
            }
        }
    }

    _emit(event) {
        this.dispatchEvent(event)
    }

}

export default CustomModel
