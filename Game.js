import { BLOCK, STATE, MOVE, DIRECTION } from './Constants.js'

const DIFF = {}
DIFF[DIRECTION.LEFT] = { x: -1, y: 0 }
DIFF[DIRECTION.RIGHT] = { x: 1, y: 0 }
DIFF[DIRECTION.UP] = { x: 0, y: -1 }
DIFF[DIRECTION.DOWN] = { x: 0, y: 1 }

const X = 0
const Y = 1

class Block {

    constructor(char) {
        this.wall = BLOCK.WALL === char
        this.target = [BLOCK.TARGET, BLOCK.TARGET_BOX, BLOCK.TARGET_WORKER].includes(char)
        this.worker = [BLOCK.WORKER, BLOCK.TARGET_WORKER].includes(char)
        this.box = [BLOCK.BOX, BLOCK.TARGET_BOX, BLOCK._BOX_LOCK].includes(char)
        this.out = BLOCK._OUT === char //special
        this.lock = BLOCK._BOX_LOCK === char //special
    }

    get char() {
        return this.wall ? BLOCK.WALL :
            this.target && this.worker ? BLOCK.TARGET_WORKER :
            this.target && this.box ? BLOCK.TARGET_BOX :
            this.target ? BLOCK.TARGET :
            this.worker ? BLOCK.WORKER :
            this.box && this.lock ? BLOCK._BOX_LOCK : //special
            this.box ? BLOCK.BOX :
            this.out ? BLOCK._OUT : //special
            ' '
    }

    get type() {
        return (this.wall ? 'wall' :
        //this.floor ? 'floor' :
        this.out ? 'out' :
        this.target ? 'target':
        '') +
        (this.worker ? ' worker' :
        this.box ? ' box' :
        '') +
        (this.lock ? ' lock' :
        '')
    }

}

const buildBlock = char => { return {
    wall: BLOCK.WALL === char,
    target: [BLOCK.TARGET, BLOCK.TARGET_BOX, BLOCK.TARGET_WORKER].includes(char),
    worker: [BLOCK.WORKER, BLOCK.TARGET_WORKER].includes(char),
    box: [BLOCK.BOX, BLOCK.TARGET_BOX, BLOCK._BOX_LOCK].includes(char),
    out: BLOCK._OUT === char, //special
    lock: BLOCK._BOX_LOCK === char, //special
    get char() {
        return this.wall ? BLOCK.WALL :
            this.target && this.worker ? BLOCK.TARGET_WORKER :
            this.target && this.box ? BLOCK.TARGET_BOX :
            this.target ? BLOCK.TARGET :
            this.worker ? BLOCK.WORKER :
            this.box && this.lock ? BLOCK._BOX_LOCK : //special
            this.box ? BLOCK.BOX :
            this.out ? BLOCK._OUT : //special
            ' '
    },
    get type() {
        return (this.wall ? 'wall' :
        this.floor ? 'floor' :
        this.out ? 'out' :
        this.target ? 'target':
        '') +
        (this.worker ? ' worker' :
        this.box ? ' box' :
        '') +
        (this.lock ? ' lock' :
        '')
    }
}}

export default class Game {

    #level = {}
    #state = STATE.INITIAL
    #moves = ''
    #todo = 0
    #blocks = []
    #errors = []
    #undo = []
    #listener = {
        'init': [],
        'update': []
    }

    constructor(level, savestate) {
        //console.log(level)
        this.#level = level
        /*if (savestate) {
            //TODO popup on loaded state or even a question .. 
            //TODO fix - restart after loadstate will restart with the loadstate :-(
            this.#loadState(savestate)
        } else {*/
            this.#setupBoard()
            this.#validateLevel()
        //}
        //console.log(this)
        this.dispatchEvent('init', this)
    }

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

    restart() {
        this.#loadState(this.#undo.shift())
        this.#undo = []
    }

    undo() {
        //console.log(this.#undo)
        this.#loadState(this.#undo.pop())
    }

    move(direction) {
        if (![STATE.INITIAL, STATE.ONGOING].includes(this.#state)) return
        const currentPos = this.#getWorkerPos()
        const nextPos = this.#getAdjacentPos(...currentPos, direction)
        //console.log(currentPos)
        const current = this.#getBlock(...currentPos)
        const next = this.#getBlock(...nextPos)
        //console.log(currentBlock, nextBlock, nextBlock2)
        //console.log(nextBlock, BOARD.FLOOR, BOARD.TARGET)
        if (next.wall) return
        if (next.box) {
            const next2Pos = this.#getAdjacentPos(...currentPos, direction, 2)
            const next2 = this.#getBlock(...next2Pos)
            if (next2.wall || next2.box) return
            this.#saveState()
            current.worker = false
            next.worker = true
            next.box = false
            next2.box = true
            next2.lock = this.#isBoxLocked(...next2Pos, next2)
            this.#moves += direction[0].toUpperCase()
            next2.id = next.id
            next.id = current.id
            current.id = undefined
        } else {
            this.#saveState()
            current.worker = false
            next.worker = true
            this.#moves += direction[0].toLowerCase()
            next.id = current.id
            current.id = undefined
        }
        this.#setState()
        //console.log('moved')
    }

    get blocks() { return this.#blocks }
    get level() { return this.#level }
    get size() { return this.#level.size }
    get moveList() { return this.#moves }
    get moves() { return (this.#moves.match(/[lrud]/g) || []).length }
    get pushes() { return (this.#moves.match(/[LRUD]/g) || []).length }
    get todo() { return this.#todo }
    get state() { return this.#state }
    get snapshot() { return this.#undo[this.#undo.length-1] }
    get progress() { return {
        state: {
            board: this.#blocks.map(row => row.map(block => block.char)),
            moves: this.#moves,
            state: this.#state
        },
        undo: this.#undo
    } }
    set progress(v) {
        //console.log('set progress', v)
        this.#undo = v.undo
        this.#loadState(v.state)
    }

    #setupBoard() {
        //console.log(this.#level)
        this.#blocks = this.#level.board.map((row, y) => 
            row.split('').map((char, x) => 
                new Block(char)))
                //buildBlock(char)))
        //console.log(this.#blocks)
        // find and mark locked boxes
        this.#blocks.forEach((row,y) => {
            row.forEach((block,x) => {
                if (block.box && !block.target)
                    block.lock = this.#isBoxLocked(x,y,block)
            })
        })
        this.#setState()
    }

    #isBoxLocked(x, y, block) {
        if (!block.box || block.target) return
        //console.log(x,y, this.#blocks[y][x])
        const locker = [
            [x-1, y], //left
            [x+1, y], //right
            [x, y-1], //above
            [x, y+1]  //below
        ].map(([x,y]) => this.#blocks[y][x].wall)
        // check 1 lock on x-axis and 1 on y-axis
        const lock = (locker[0] || locker[1]) && (locker[2] || locker[3])
        //console.log(lock)
        if (lock) this.#state = STATE.LOCKED
        return lock
    }

    #validateLevel() {
        const worker = this.#queryBlocks((ret, block, x, y) => {
            if (block.worker) return ++ret
            return ret
        }, 0)
        const targets = this.#queryBlocks((ret, block, x, y) => {
            if (block.target) return ++ret
            return ret
        }, 0)
        const boxes = this.#queryBlocks((ret, block, x, y) => {
            if (block.box) ++ret
            return ret
        }, 0)
        const locked = this.#queryBlocks((ret, block, x, y) => {
            if (block.lock) ++ret
            return ret
        }, 0)
        let missingWall = 0
        this.#queryBlocks((_, block, x, y) => {
            // check if enclosed by walls
            if (block.target || block.worker || block.box) {
                if (!this.#findBlock(x, y, 0, -1, 'wall')
                    || !this.#findBlock(x, y, 0, 1, 'wall')
                    || !this.#findBlock(x, y, -1, 0, 'wall')
                    || !this.#findBlock(x, y, 1, 0, 'wall')) {
                        missingWall++
                    }
            }
            
        })
        this.#errors = []
        if (worker > 1) 
            this.#errors.push('more than one worker')
        if (targets.length !== boxes.length) 
            this.#errors.push('target and box count does not match')
        if (targets < 1) 
            this.#errors.push('no targets defined')
        if (this.#todo < 1) 
            this.#errors.push('already solved')
        if (missingWall > 0) 
            this.#errors.push('at least one block is not enclosed by walls')
        if (locked > 0) 
            this.#errors.push('at least one box cannot be moved')
        //TODO check for wall and not reachable targets/boxes
        //console.log(this.#errors)
        if ( this.#errors.length > 0)
            this.#state = STATE.ERROR
    }

    #setState() {
        this.#todo = this.#queryBlocks((ret, block) => {
            return block.box && !block.target
                ? ++ret
                : ret
        }, 0)
        this.#state = this.#state === STATE.ERROR // set by validateMap
            ? STATE.ERROR
            : this.#state === STATE.LOCKED //set by isBoxLocked
                ? STATE.LOCKED
                : this.#errors.length > 0
                    ? STATE.ERROR
                    : this.moves+this.pushes === 0
                        ? STATE.INITIAL
                        : this.#todo === 0
                            ? STATE.SOLVED
                            : STATE.ONGOING
        //console.log(this.#state)
        this.dispatchEvent('update', this)
    }    

    #saveState() {
        //console.log('object', JSON.stringify(this.#blocks).length)
        //console.log('char', JSON.stringify(this.#blocks.map(row=>row.map(block=>block.char))).length)
        this.#undo.push({
            board: this.#blocks.map(row => row.map(block => block.char)),
            moves: this.#moves,
            state: this.#state
        })
        console.log('saveState', this.#undo)
    }

    #loadState(state) {
        if (!state) return
        //console.log('load State', state)
        this.#blocks = state.board.map((row, y) => 
            row.map((char, x) => 
                new Block(char)))
                //buildBlock(char)))
        this.#moves = state.moves
        this.#state = state.state
        this.#setState()
    }

    #findBlock(sx, sy, dx, dy, type) {
        let x = sx + dx
        let y = sy + dy
        let found = false
        while(!found
            && x >= 0 && x <= this.#level.size.width
            && y >= 0 && y <= this.#level.size.height) {
            found = this.#blocks[y][x][type]
            x += dx
            y += dy
        }
        return found
    }

    #queryBlocks(func, initialRet) {
        let ret = initialRet
        this.#blocks.forEach((row, y) => row.forEach((block, x) => ret = func(ret, block, x, y)))
        return ret
    }

    #getWorkerPos() {
        const xs = this.#blocks.reduce((acc, row) => [...acc, row.findIndex(block=>block.worker)], [])
        const y = xs.findIndex(x => x !== -1)
        return [xs[y], y]
    }

    #getAdjacentPos(x, y, direction, distance=1) {
        const diff = DIFF[direction]
        //console.log(DIFF, direction)
        return [x + diff.x * distance, y + diff.y * distance]
    }

    #getBlock(x, y) {
        //console.log(y, x, this.#blocks[y])
        return this.#blocks[y][x]
    }

}