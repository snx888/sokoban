import { STATE } from './Constants.js'

export default class SaveState {

    static clear() {
        Object.keys(localStorage)
            .filter(key => key.match(/^sokoban_state_/))
            .forEach(key => localStorage.removeItem(key))
    }

    #level
    #id
    #data

    constructor(level) {
        this.#level = level
        this.#id = 'sokoban_state_pack_' + level.pack + '_level_' + level.name
        this.#data = JSON.parse(localStorage.getItem(this.#id)) || []
    }

    update(game) {
        if ([STATE.INITIAL, STATE.SOLVED].includes(game.state))
            this.#remove()
        else if (game.state === STATE.ONGOING)
            this.#save(game)
    }

    #save(game) {
        //console.log('save state..')
        this.#data = {
            timestamp: Math.floor(Date.now() / 1000),
            state: game.snapshot
        }
        localStorage.setItem(this.#id, JSON.stringify(this.#data))
    }

    #remove() {
        //console.log('delete state..')
        localStorage.removeItem(this.#id)
    }

    get state() { return this.#data.state }

}