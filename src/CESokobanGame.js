import { defineElement, CustomElement } from './base/CustomElement.js'
import './CESokobanStats'
import './CESokobanBoard'
import sokoban from './Sokoban.js'
import { DIRECTION } from './Constants.js'


defineElement({
    tag: 'ce-sokoban-game',
    template: function(data) { return /*html*/`
        <style>
            :host {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            ce-sokoban-board {
                height: 100%;
                position: relative;
                overflow: hidden;
            }
        </style>
        <ce-sokoban-stats pushes="0" moves="0" todo="0" state="?" movelist=""></ce-sokoban-stats>
        <ce-sokoban-board></ce-sokoban-board>
    `},
    el: {
        stats: 'ce-sokoban-stats',
        board: 'ce-sokoban-board'
    },
    class: class extends CustomElement {
        _keydown = false
        constructor() {
            super()
            sokoban.addEventListener('gameStart', game => {
                this.update(true)
                game.addEventListener('update', game => {
                    this.update()
                })           
            })
        }
        update(game=false) {
            this._el.stats.setAttribute('moves', sokoban.game.moves)
            this._el.stats.setAttribute('pushes', sokoban.game.pushes)
            this._el.stats.setAttribute('todo', sokoban.game.todo)
            if (!game) return
            this._el.stats.setAttribute('pack', sokoban.game.level.pack)
            this._el.stats.setAttribute('level', sokoban.game.level.name)
            this._el.stats.setAttribute('number', sokoban.game.level.number)
        }
    },
    on: [
        ['ce-sokoban-board', 'mousedown', function(e) {
            if (!sokoban.game) return
            this.down = [e.offsetX, e.offsetY]
        }],
        ['ce-sokoban-board', 'mousemove', function(e) {
            if (!sokoban.game) return
            if (!this.down) return
            const up = [e.offsetX, e.offsetY]
            const diff = [up[0]-this.down[0], up[1]-this.down[1]]
            if (Math.max(Math.abs(diff[0]), Math.abs(diff[1])) < 20) return
            let direction
            if (Math.abs(diff[0]) > Math.abs(diff[1])) {
                direction = diff[0] > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT
            } else {
                direction = diff[1] > 0 ? DIRECTION.DOWN : DIRECTION.UP
            }
            if (direction) {
                sokoban.game.move(direction)
                e.stopPropagation()
            }
            //console.log(swipe, diff, this.down, up)
            this.down = null
        }],
        ['ce-sokoban-board', 'mouseup', function(e) {
            if (!sokoban.game) return
            this.down = null
        }],
        ['ce-sokoban-board', 'touchstart', function(e) {
            if (!sokoban.game) return
            this.down = [e.touches[0].clientX, e.touches[0].clientY]
        }],        
        ['ce-sokoban-board', 'touchmove', function(e) {
            if (!sokoban.game) return
            if (!this.down) return
            const up = [e.touches[0].clientX, e.touches[0].clientY]
            const diff = [up[0]-this.down[0], up[1]-this.down[1]]
            let direction
            if (Math.abs(diff[0]) > Math.abs(diff[1])) {
                direction = diff[0] > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT
            } else {
                direction = diff[1] > 0 ? DIRECTION.DOWN : DIRECTION.UP
            }
            if (direction) {
                sokoban.game.move(direction)
                e.stopPropagation()
            }
            //console.log(swipe, diff, this.down, up)
            this.down = null
        }],
        ['ce-sokoban-board', 'keydown', function(e) {
            if (!sokoban.game) return
            if (this._keydown !== false) return
            this._keydown = true
            //console.log(e)
            let direction
            switch(e.key) {
                case 'w':
                case 'ArrowUp': direction = DIRECTION.UP
                    break
                case 's':
                case 'ArrowDown': direction = DIRECTION.DOWN
                    break
                case 'a':
                case 'ArrowLeft': direction = DIRECTION.LEFT
                    break
                case 'd':
                case 'ArrowRight': direction = DIRECTION.RIGHT
                    break
                case 'Escape': sokoban.game.restart()
                    break
                case 'Backspace': sokoban.game.undo()
                    break
            }
            if (direction) {
                sokoban.game.move(direction)
                e.stopPropagation()
            }
        }],
        [document /*'ce-sokoban-board'*/, 'keyup', function(e) {
            if (!sokoban.game) return
            this._keydown = false
        }]
    ]
})
