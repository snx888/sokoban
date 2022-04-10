import { STATE } from './Constants.js'

export default class History {

    #id
    #data

    constructor() {
        this.#id = 'sokoban_history'
        this.#data = JSON.parse(localStorage.getItem(this.#id)) || []
    }

    update(game) {
        if (game.state === STATE.SOLVED)
            this.#set(game.level, true)
        else if(game.state === STATE.ONGOING && game.moves === 1)
            this.#set(game.level)
    }

    get data() { return this.#data }

    #set(level, solved=false) {
        //console.log('set history')
        this.#data = this.#data
            .filter(item => item.pack !== level.pack || item.name !== level.name)
            .slice(0, 20)
        this.#data.unshift({
            pack: level.pack,
            name: level.name,
            solved: solved
        })
        localStorage.setItem(this.#id, JSON.stringify(this.#data))
    }

}