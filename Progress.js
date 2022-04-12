import { STATE } from './Constants.js'

export default class Progress {

    #id
    #data

    constructor() {
        this.#id = 'sokoban_progress'
        this.#data = JSON.parse(localStorage.getItem(this.#id)) || {}
    }

    update(game) {
        if (game.state === STATE.ONGOING)
            this.#set(game.level, game.progress)
        else if([STATE.ERROR, STATE.INITIAL, STATE.SOLVED].includes(game.state))
            this.#reset()
    }   

    clear() {
        localStorage.removeItem(this.#id)
    }

    get data() { return this.#data }

    #set(level, progress) {
        //console.log('set history')
        this.#data = {
            pack: level.pack,
            name: level.name,
            state: progress.state,
            undo: progress.undo
        }
        localStorage.setItem(this.#id, JSON.stringify(this.#data))
    }

    #reset() {
        this.#data = {}
        localStorage.removeItem(this.#id)
    }

}