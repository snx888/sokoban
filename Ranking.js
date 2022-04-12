import { STATE } from './Constants.js'

export default class Ranking {

    static clear() {
        Object.keys(localStorage)
            .filter(key => key.match(/^sokoban_ranking_/))
            .forEach(key => localStorage.removeItem(key))
    }

    #level
    #id
    #data

    constructor(level) {
        this.#level = level
        this.#id = 'sokoban_ranking_pack_' + level.pack + '_level_' + level.name
        this.#data = JSON.parse(localStorage.getItem(this.#id)) || []
    }

    update(game) {
        if (game.state !== STATE.SOLVED) return
        //console.log('save ranking..')
        this.#data.push({
            timestamp: Math.floor(Date.now() / 1000),
            name: 'snx',
            moveList: game.moveList,
            moves: game.moves,
            pushes: game.pushes
        })
        localStorage.setItem(this.#id, JSON.stringify(this.#data))
    }

    get data() { return this.#data }

}