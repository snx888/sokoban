import levelLoader from './LevelLoader.js'
import Game from './Game.js'
import SaveState from './SaveState.js'
import Progress from './Progress.js'
import History from './History.js'
import Ranking from './Ranking.js'

export default new class {

    history = new History()
    progress = new Progress()
    levelpacks
    game


    #listener = {
        gameStart: [],
        levelSelect: [],
        progressReset: []
    }

    loadLevels() {
        return Promise.all([
            'Sokoban Jr. 1', 'Sokoban Jr. 2'
        ].map(pack => levelLoader.loadPack(pack)))
        .then(packs => {
            let solves = []
            packs.forEach(pack => {
                pack.level.forEach((level, l) => {
                    level.number = l+1
                    level.ranking = new Ranking(level)
                    level.savestate = new SaveState(level)
                    level.game = new Game(level, level.savestate.state)
                    level.game.addEventListener('update', game => {
                        this.history.update(level.game)
                        this.progress.update(level.game)
                        level.ranking.update(level.game)
                        level.savestate.update(level.game)
                    })
                    //set locked until 3/5 in previous row are solved
                    level.locker = [...solves]
                    level.lock = function() {
                        //console.log("test", this.locker.length, this.locker.reduce((a,i)=>a+=i.length?1:0,0))
                        return this.locker.length === 5 && this.locker.reduce((a,i)=>a+=i.length?1:0,0) < 3
                    }
                    if (solves.length > 4) solves.pop()
                    solves.unshift(level.ranking.data)
                })
                return pack
            })
            this.levelpacks = packs
            return packs
        })
    }

    startGame(levelpack, level) {
        const lvl = this.levelpacks.find(pack => pack.name === levelpack)
            .level.find(lvl => lvl.name === level)
        //console.log(lvl)
        this.game = lvl.game
        if (this.progress.data.pack === this.game.level.pack &&
            this.progress.data.name === this.game.level.name)
            this.game.progress = this.progress.data
        this.dispatchEvent('gameStart', lvl.game)
    }

    resetProgress() {
        //console.log('reset progress')
        this.progress.clear()
        this.history.clear()
        SaveState.clear()
        Ranking.clear()
        this.dispatchEvent('progressReset')
    }

    selectLevel() {
        this.game = null
        this.dispatchEvent('levelSelect')
    }
    /*
    nextMap() {
        if (++this.map >= this.maps.length) this.map = 0
        this.loadMap(this.map)
    }

    randomMap() {
        this.loadMap(Math.floor(Math.random()*this.maps.length))
    }

    */

    addEventListener(event, listener) {
        const e = this.#listener[event]
        if (!e) return
        e.push(listener)
    }

    dispatchEvent(event, ...args) {
        const e = this.#listener[event]
        if (!e) return
        e.forEach(listener=>listener(...args))
    }
}
