export const BLOCK = {
    FLOOR: ' ',
    WALL: '#',
    TARGET: '.',
    WORKER: '@',
    BOX: '$',
    TARGET_BOX: '*',
    TARGET_WORKER: '+',
    _BOX_LOCK: '!', //special
    _OUT: '_' //special
}

export const STATE = {
    INITIAL: 0,
    ONGOING: 1,
    SOLVED: 2,
    LOCKED: 3
}

export const MOVE = {
    LEFT: 'l',
    RIGHT: 'r',
    UP: 'u',
    DOWN: 'd',
    LEFT_PUSH: 'L',
    RIGHT_PUSH: 'R',
    UP_PUSH: 'U',
    DOWN_PUSH: 'D'
}

export const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
}
const DIFF = {}
DIFF[DIRECTION.LEFT] = { x: -1, y: 0 }
DIFF[DIRECTION.RIGHT] = { x: 1, y: 0 }
DIFF[DIRECTION.UP] = { x: 0, y: -1 }
DIFF[DIRECTION.DOWN] = { x: 0, y: 1 }

const X = 0
const Y = 1

export default class Sokoban {

    static _levelpacks = []
    static _selectedLevelpack = 0
    static _levels = []

    static async loadLevelPacks() {
        return new Promise((resolve, reject) => {
            this._levelPacks = [
                'test1',
                'test2',
                'test3',
                'test4',
                'test5',
                'test6',
                'test7',
                'test8',
                'test9',
                'test10',
                'test11',
                'Tutorial',
                'Sokoban',
                'Sokoban Jr. 1',
                'Sokoban Jr. 2',
                'Sokoban Deluxe',
                'Sokogen 990602',
                'Xsokoban',
                'David Holland 1',
                'David Holland 2',
                `Howard's 1st set`,
                `Howard's 2nd set`,
                `Howard's 3rd set`,
                `Howard's 4th set`,
                'Sasquatch', //http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Sasquatch II', //http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Sasquatch III', ////http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Sasquatch IV', ////http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Sasquatch V', ////http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Sasquatch VI', ////http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Sasquatch VII', ////http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Sasquatch VIII', ////http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Sasquatch IX', ////http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Sasquatch X', ////http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Sasquatch XI', ////http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Microban', //http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Microban II', //http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Microban III', //http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Microban IV', //http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm
                'Mas Sasquatch',
                'Still more levels',
                'Nabokosmos',
                'Microcosmos', //https://www.onlinespiele-sammlung.de/sokoban/sokobangames/nabokos/levels0.txt
                'Minicosmos', //https://www.onlinespiele-sammlung.de/sokoban/sokobangames/nabokos/levels0.txt
                'Simple sokoban',
                'Dimitri and Yorick',
                'Yoshio Automatic',
                'LOMA',
                'myriocosmos',
                'sokoban_online', //http://sokoban.online.fr/collections.html
                'soloban', //http://sokoban.online.fr/collections.html
                'novoban', //http://sokoban.online.fr/collections.html
                'numbers', //http://sokoban.online.fr/collections.html
                'sokolate', //http://sokoban.online.fr/collections.html
                'sokompact', //http://sokoban.online.fr/collections.html            
                'kokoban', //http://sokoban.online.fr/collections.html            
                '100boxes', //http://sokoban.online.fr/collections.html
                '_various' //http://sokoban.online.fr/collections.html
           ].map((level,i) => { return { id:i, name: level } })
            resolve(this._levelPacks)
        })
    }

    static async loadLevels(id) {
        this._selectedLevelpack = id
        let count = 0
        const patternMap = /(^|\n|\r)(\s*)(\#|\#[ \.\@\+\$\*\#]*\#)(\s*)($|\n|\r)/
        const patternMapLine =     /^(\s*)(\#|\#[ \.\@\+\$\*\#]*\#)(\s*)$/
        return fetch(`./maps/${id.name}.txt`)
        .then(res => res.text())
        /*.then(res => res.split(/\s\-\-\-\s/)
            // at least one map line in each section
            .filter(item => patternMap.test(item.trim()))
            .map(lines => { 
                //console.log(lines)
                const level = {
                    id: count++,
                    name: '',
                    charmap: [],
                    info: []
                }
                lines.split(/\n|\r/).forEach(line => {
                    if (patternMapLine.test(line)) {
                        level.charmap.push(line)
                    }
                    else {
                        if (line.length > 0) level.info.push(line)
                    }
                })
                level.name = this.#extractName(level.info) || level.id
                //console.log(level)
                return level
            })
        )*/
        .then(text => text.split(/\n|\r/))
        .then(lines => lines.filter(line => !!line))
        .then(lines => {
            console.log(id.name)
            const levels = [{
                id: count++,
                info: [],
                charmap: []
            }]
            let level = 0
            lines.forEach(line => {
                if (patternMapLine.test(line)) {
                    // is map
                    levels[level].charmap.push(line)
                }
                else {
                    // is text
                    if (levels[level].charmap.length > 0) {
                        // after map
                        levels[++level] = ({
                            id: count++,
                            info: [],
                            charmap: []
                        })
                        if (line) levels[level].info.push(line)
                    } else {
                        // before map
                        if (line) levels[level].info.push(line)
                    }
                }
            })
            const title = 
                levels[0].info.find(line => line.match(/title\:(.*)/i))
                ? 'before' : 
                levels[1].info.find(line => line.match(/title\:(.*)/i))
                ? 'after' :
                ''
            /*console.clear()
            console.log(title)
            console.log(lines)
            console.log(levels)*/
            levels.forEach((level,i) => {
                if (!level.charmap.length) {
                    levels.pop()
                    return
                }
                if (title === 'after') {
                    level.name = this.#extractName(levels[i+1].info)
                } else {
                    level.name = this.#extractName(level.info.reverse())
                }
                if(level.name) level.name = level.name[1]
                else level.name = level.id
            })
            /*console.log(levels)
            return JSON.parse(JSON.stringify(levels))*/
            return levels
        })
        .then(levels => {
            this._levels = levels
            return levels
        })
    }

    static #extractName(info) {
        let name
        info.some(line => {
            name = line.match(/title\:\s*['"`]?([^'"`]*)['"`]?/i)
            if (name) return true
        })
        if (name) return name
        info.some(line => {
            name = line.match(/['"`]([^'"`]*)['"`]/)
                || line.match(/^[;]?\s*(.*)\s*$/)
            if (name) return true
        })
        /*if (name) return name
        info.some(line => {
            name = line.match(/^[;]?\s*(.*)\s*$/)
            return true
        })*/
        return name
    }

    static loadLevel(level) {
        return new Sokoban(level)
    }

    #nextID = 0
    #level = {}
    #state = STATE.INITIAL
    #moves = ''
    #todo = 0
    #blocks = []
    #size = {}
    #worker = []
    #targets = []
    #boxes = []
    #errors = []
    #undo = []

    constructor(level) {
        //console.log(level)
        this.#level = level
        this.#initialize()
    }

    #initialize() {
        this.#setupBoard(this.#level)
        this.#validateLevel()
        this.#worker = this.#worker[0]
        //console.log(this)
    }

    #setupBoard(level) {
        this.#size = {
            width: Math.max(...level.charmap.map(row => row.length)),
            height: level.charmap.length
        },
        this.#blocks = level.charmap.map((row, y) => 
            row.split('').map((char, x) => this.#buildBlock(char))
        )
        this.#calcTodo()
        this.#blocks.filter(row => row.length < this.#size.width)
            .forEach((row) => {
                let times = this.#size.width - row.length
                while (times--) row.push(this.#buildBlock(''))
            })
        this.#blocks.forEach(row => {
            let start = false
            row.forEach(block => {
                if (!start) {
                    block.out = !block.wall && !block.target && !block.worker && !block.box
                    start = block.wall
                }
            })
            let end = false
            row.reverse().forEach(block => {
                if (!end) {
                    block.out = !block.wall && !block.target && !block.worker && !block.box
                    end = block.wall
                }
            })
            row.reverse()
        })
        this.#blocks.forEach((row,y) => {
            row.forEach((block,x) => {
                if (block.box && !block.target)
                    block.lock = this.#checkLock(x,y,block)
            })
        })
    }

    #checkLock(x, y, block) {
        if (!block.box || block.target) return
        //console.log(x,y, this.#blocks[y][x])
        const locker = [
            this.#blocks[y][x-1],
            this.#blocks[y-1][x],
            this.#blocks[y][x+1],
            this.#blocks[y+1][x]
        ].map(a => a.wall)
        const lock = (locker[0] || locker[2]) && (locker[1] || locker[3])
        //console.log(lock)
        if (lock) this.#state = STATE.LOCKED
        return lock
    }

    #findBlock(sx, sy, dx, dy, type) {
        let x = sx + dx
        let y = sy + dy
        let found = false
        while(!found
            && x >= 0 && x <= this.#size.width
            && y >= 0 && y <= this.#size.height) {
            found = this.#blocks[y][x][type]
            x += dx
            y += dy
        }
        return found
    }

    #buildBlocks(charmap) {
        this.#blocks = charmap.map((row, y) => 
            row.split('').map((char, x) => 
                this.#buildBlock(char)
            )
        )
    }

    #buildBlock(char) {
        return {
            wall: char === BLOCK.WALL,
            target: [BLOCK.TARGET, BLOCK.TARGET_BOX, BLOCK.TARGET_WORKER].includes(char),
            worker: [BLOCK.WORKER, BLOCK.TARGET_WORKER].includes(char),
            box: [BLOCK.BOX, BLOCK.TARGET_BOX, BLOCK._BOX_LOCK].includes(char),
            id: [BLOCK.WORKER, BLOCK.TARGET_WORKER, BLOCK.BOX, BLOCK.TARGET_BOX].includes(char) ? ++this.#nextID : undefined,
            out: char === BLOCK._OUT, //special
            lock: char === BLOCK._BOX_LOCK,
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
        }
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
    }

    #queryBlocks(func, initialRet) {
        let ret = initialRet
        this.#blocks.forEach((row, y) => row.forEach((block, x) => ret = func(ret, block, x, y)))
        return ret
    }

    #calcTodo() {
        this.#todo = this.#queryBlocks((ret, block) => {
            return block.box && !block.target
                ? ++ret
                : ret
        }, 0)
        this.#state = this.#state === STATE.LOCKED //set by checkLock
            ? STATE.LOCKED
            : this.moves === 0
                ? STATE.INITIAL
                : this.#todo === 0
                    ? STATE.SOLVED
                    : STATE.ONGOING
        //console.log(this.#state)
    }    

    #saveState() {
        //console.log('object', JSON.stringify(this.#blocks).length)
        //console.log('char', JSON.stringify(this.#blocks.map(row=>row.map(block=>block.char))).length)
        this.#undo.push({
            charmap: this.#blocks.map(row => row.map(block => block.char)),
            moves: this.#moves,
            state: this.#state
        })
    }

    #loadState(state) {
        if (!state) return
        this.#blocks = state.charmap.map((row, y) => 
            row.map((char, x) => this.#buildBlock(char))
        )
        this.#moves = state.moves
        this.#state = state.state
        this.#calcTodo()
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

    restart() {
        this.#loadState(this.#undo.shift())
        this.#undo = []
    }

    undo() {
        //console.log(this.#undo)
        this.#loadState(this.#undo.pop())
    }

    nextMap() {
        if (++this.map >= this.maps.length) this.map = 0
        this.loadMap(this.map)
    }

    randomMap() {
        this.loadMap(Math.floor(Math.random()*this.maps.length))
    }

    move(direction) {
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
            next2.lock = this.#checkLock(...next2Pos, next2)
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
        this.#calcTodo()
        //console.log('moved')
    }

    get blocks() { return this.#blocks }
    get size() { return this.#size }
    get moveList() { return this.#moves }
    get moves() { return (this.#moves.match(/[lrud]/g) || []).length }
    get pushes() { return (this.#moves.match(/[LRUD]/g) || []).length }
    get todo() { return this.#todo }
    get state() { return this.#state }
}