import { createModel, CustomModel } from './base/CustomModel.js'

const BOARD = {
    EMPTY: ' ',
    WALL: 'W',
    TARGET: 'T',
    PLAYER: 'P',
    BOX: 'B',
    TARGET_BOX: 'b',
    TARGET_PLAYER: 'p'
}

const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
}

const X = 0
const Y = 1

export default createModel({
    data: {
        map: 0,
        moves: 0,
        open: 0,
        board: [],
        player: [0, 0]
    },
    class: class extends CustomModel {

        async loadMap(id) {
            this.data.board = await fetch(`./maps/${id}.json`)
                .then(res => res.json())
                .then(map => map.rows.map(row => row.split('')))
            this.data.map = id
            this.data.player = this._findPlayerPosition()
            this.data.open = this._countOpenTargets()
            this.data.moves = 0
            //console.log(this.data.board, this.data.player)
            this.dispatchEvent(new Event('started'))
        }

        restart() {
            this.loadMap(this.data.map)
        }

        move(direction) {
            let current = [...this.data.player]
            let next = [...this.data.player]
            let next2 = [...this.data.player]
            switch(direction) {
                case DIRECTION.LEFT: 
                    next[X] -= 1
                    next2[X] -= 2
                    break
                case DIRECTION.RIGHT:
                    next[X] += 1
                    next2[X] += 2
                    break
                case DIRECTION.UP: 
                    next[Y] -= 1
                    next2[Y] -= 2
                    break
                case DIRECTION.DOWN:
                    next[Y] += 1
                    next2[Y] += 2
                    break
            }
            //console.log(this.data.player, current, next, next2)
            const currentBlock = this._getBlock(current)
            const nextBlock = this._getBlock(next)
            const nextBlock2 = this._getBlock(next2)
            //console.log(currentBlock, nextBlock, nextBlock2)
            //console.log(nextBlock, BOARD.EMPTY, BOARD.TARGET)
            if ([BOARD.EMPTY, BOARD.TARGET].includes(nextBlock)) {
                //console.log('next is empty -> going there')
                this._setBlock(current, currentBlock === BOARD.PLAYER ? BOARD.EMPTY : BOARD.TARGET)
                this._setBlock(next, nextBlock === BOARD.TARGET ? BOARD.TARGET_PLAYER : BOARD.PLAYER)
            }
            else if ([BOARD.BOX, BOARD.TARGET_BOX].includes(nextBlock)
                && [BOARD.EMPTY, BOARD.TARGET].includes(nextBlock2)) {
                    //console.log('next is block -> push')
                    this._setBlock(current, currentBlock === BOARD.PLAYER ? BOARD.EMPTY : BOARD.TARGET)
                    this._setBlock(next, nextBlock === BOARD.TARGET_BOX ? BOARD.TARGET_PLAYER : BOARD.PLAYER)
                    this._setBlock(next2, nextBlock2 === BOARD.TARGET ? BOARD.TARGET_BOX : BOARD.BOX)
                }
            else {
                //console.log('no move')
                return
            }
            this.data.moves++
            this.data.player = next
            this.data.open = this._countOpenTargets()
            this.dispatchEvent(new Event('moved'))
            if (open === 0) {
                console.log('wow, you are the winner !!')
                this.dispatchEvent(new Event('succeeded'))
            }
        }

        _setBlock([x, y], block) {
            this.data.board[y][x] = block
        }
        _getBlock([x, y]) {
            //console.log('get',x,y)
            if (x < 0 || x > 7 || y < 0 || y > 8) return undefined
            return this.data.board[y][x]
        }

        _findPlayerPosition() {
            const y = this.data.board.findIndex(row => row.includes(BOARD.PLAYER || BOARD.TARGET_PLAYER))
            const x = this.data.board[y].indexOf(BOARD.PLAYER || BOARD.TARGET_PLAYER)//findIndex(col => col in [BOARD.PLAYER, BOARD.TARGET_PLAYER])
            //console.log(x, y)
            return [x, y]
        }

        _countOpenTargets() {
            const open = this.data.board.reduce((acc, row) => [
                ...acc, 
                ...row.filter(col => [BOARD.TARGET, BOARD.TARGET_PLAYER].includes(col))
            ], [])
            //console.log(open.length)
            return open.length
        }

    }
})
