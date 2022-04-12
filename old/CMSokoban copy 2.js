const LEVEL = {
    FLOOR: ' ',
    WALL: '#',
    TARGET: '.',
    PLAYER: '@',
    BOX: '$',
    TARGET_BOX: '*',
    TARGET_PLAYER: '+'
}

export const BOARD = {
    FLOOR: ' ',
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

export default class {
    _listener = {
        started: [],
        moved: [],
        succeeded: []
    }
    maps = []
    map = 0
    maxX = 0
    maxY = 0
    moves = 0
    open = 0
    board = []
    player = [0, 0]

    constructor() {
        this.loadMaps()
    }

    static _levelpacks = []
    static _selectedLevelpack = 0
    static _levels = []

    static async loadLevelPacks() {
        return new Promise((resolve, reject) => {
            this._levelPacks = [
                { id: 0, name: 'Tutorial' },
                { id: 1, name: 'Sokoban' },
                { id: 2, name: 'Sokoban Jr. 1' },
                { id: 3, name: 'Sokoban Jr. 2' },
                { id: 4, name: 'Sokoban Deluxe' },
                { id: 5, name: 'Sokogen 990602">Sokogen 990602' },
                { id: 6, name: 'Xsokoban' },
                { id: 7, name: 'David Holland 1' },
                { id: 8, name: 'David Holland 2' },
                { id: 9, name: `Howard's 1st set` },
                { id: 10, name: `Howard's 2nd set` },
                { id: 11, name: `Howard's 3rd set` },
                { id: 12, name: `Howard's 4th set` },
                { id: 13, name: 'Sasquatch' },
                { id: 14, name: 'Mas Sasquatch' },
                { id: 15, name: 'Sasquatch III' },
                { id: 16, name: 'Sasquatch IV' },
                { id: 17, name: 'Still more levels' },
                { id: 18, name: 'Nabokosmos' },
                { id: 19, name: 'Microcosmos' },
                { id: 20, name: 'Microban' },
                { id: 21, name: 'Simple sokoban' },
                { id: 22, name: 'Dimitri and Yorick' },
                { id: 23, name: 'Yoshio Automatic' }
            ]
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
        .then(res => res.split(/\s\-\-\-\s/)
            .filter(item => patternMap.test(item.trim()))
            .map(lines => { 
                //console.log(lines)
                const level = {
                    id: count++,
                    name: '',
                    rows: []
                }
                lines.split('\n').forEach(line => {
                    if (patternMapLine.test(line)) {
                        level.rows.push(line)
                    }
                    else {
                        level.name = line.replace(';', '').trim() || level.name
                    }
                })
                //console.log(level)
                return level
            })
        )
        .then(levels => {
            this._levels = levels
            return levels
        })
    }

    loadLevel(level) {
        //const level = this.constructor._levels.filter(level => level.id === id)[0]
        //console.log(id, level, this.constructor._levels)
        console.log(level)
        const detail = {
            id: level.id,
            name: level.name,
            rows: level.rows,
            moves: 0,
            pushes: 0,
            board: level.rows.map((row, y) => 
                row.split('').map((block, x) => { return {
                    wall: block === LEVEL.WALL,
                    target: [LEVEL.TARGET, LEVEL.TARGET_BOX, LEVEL.TARGET_PLAYER].includes(block),
                    player: [LEVEL.PLAYER, LEVEL.TARGET_PLAYER].includes(block),
                    box: [LEVEL.BOX, LEVEL.TARGET_BOX].includes(block)
                }})
            ),
            size: {
                width: Math.max(...level.rows.map(row => row.length)),
                height: level.rows.length
            },
            player: [],
            targets: [],
            boxes: [],
            errors: []
        }
        detail.player = this._queryBoard(detail.board, (ret, block, x, y) => {
            if (block.player) return [...ret, [x, y]]
            return ret
        }, [])
        detail.targets = this._queryBoard(detail.board, (ret, block, x, y) => {
            if (block.target) return [...ret, [x, y]]
            return ret
        }, [])
        detail.boxes = this._queryBoard(detail.board, (ret, block, x, y) => {
            if (block.box) return [...ret, [x, y]]
            return ret
        }, [])
        // validate
        if (detail.player.length > 1) detail.errors.push('more than one player')
        if (detail.targets.length !== detail.boxes.length) details.error.push('target and box count does not match')
        if (detail.targets < 1) details.errors.push('no targets defined')
        //TODO check for wall and not reachable targets/boxes
        console.log(detail)
        return new Promise((resolve, reject) => detail)
    }

    _queryBoard(board, func, initialRet) {
        let ret = initialRet
        board.forEach((row, y) => row.forEach((block, x) => ret = func(ret, block, x, y)))
        return ret
    }

    async loadMaps() {
        const line = /(^|\n|\r)(\s*)(\#|\#[ \.\@\+\$\*\#]*\#)(\s*)($|\n|\r)/
        let maps = ''
        await fetch(`./maps/Simple sokoban.txt`)
        .then(res => res.text())
        .then(res => {
            maps = res.split(/\s\-\-\-\s/).map(d => `<pre class="${line.test(d) ? 'sokoban' : ''}">${d.trim()}</pre>`).join('')
        })
        //console.log(maps)
        /*let cnt = 0
        this.maps = [
            await fetch(`./maps/1.json`)
                .then(res => res.json())
                .then(map => map.rows.map(row => row.split('').map(col => { return { type: col, id: [BOARD.PLAYER, BOARD.TARGET_PLAYER, BOARD.BOX, BOARD.TARGET_BOX].includes(col) ? ++cnt : 0 } })))
        ]
        this.loadMap(this.map)*/
    }

    loadMap(id) {
        //console.log('hhmmm', this.map, this.maps.length)
        this.map = id
        if (this.maps.length < 1) return
        this.board = JSON.parse(JSON.stringify(this.maps[id]))
        this.maxY = this.board.length
        this.maxX = this.board.reduce((acc, row) => row.length > acc ? row.length : acc, 0)
        this.player = this._findPlayerPosition()
        this.open = this._countOpenTargets()
        this.moves = 0
        //console.log(this.board, this.player)
        this._listener.started.forEach(l => l())
    }

    addEventListener(event, listener) {
        this._listener[event].push(listener)
    }

    restart() {
        this.loadMap(this.map)
    }

    nextMap() {
        if (++this.map >= this.maps.length) this.map = 0
        this.loadMap(this.map)
    }

    randomMap() {
        this.loadMap(Math.floor(Math.random()*this.maps.length))
    }

    move(direction) {
        let current = [...this.player]
        let next = [...this.player]
        let next2 = [...this.player]
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
        //console.log(this.player, current, next, next2)
        const currentBlock = this._getBlock(current)
        const nextBlock = this._getBlock(next)
        const nextBlock2 = this._getBlock(next2)
        //console.log(currentBlock, nextBlock, nextBlock2)
        //console.log(nextBlock, BOARD.FLOOR, BOARD.TARGET)
        if ([BOARD.FLOOR, BOARD.TARGET].includes(nextBlock.type)) {
            //console.log('next is empty -> going there')
            this._setBlock(current, currentBlock.type === BOARD.PLAYER ? BOARD.FLOOR : BOARD.TARGET)
            this._setBlock(next, nextBlock.type === BOARD.TARGET ? BOARD.TARGET_PLAYER : BOARD.PLAYER, currentBlock.id)
        }
        else if ([BOARD.BOX, BOARD.TARGET_BOX].includes(nextBlock.type)
            && [BOARD.FLOOR, BOARD.TARGET].includes(nextBlock2.type)) {
                //console.log('next is block -> push')
                this._setBlock(current, currentBlock.type === BOARD.PLAYER ? BOARD.FLOOR : BOARD.TARGET)
                this._setBlock(next, nextBlock.type === BOARD.TARGET_BOX ? BOARD.TARGET_PLAYER : BOARD.PLAYER, currentBlock.id)
                this._setBlock(next2, nextBlock2.type === BOARD.TARGET ? BOARD.TARGET_BOX : BOARD.BOX, nextBlock.id)
            }
        else {
            //console.log('no move')
            return
        }
        this.moves++
        this.player = next
        this.open = this._countOpenTargets()
        this._listener.moved.forEach(l => l())
        if (this.open === 0) {
            console.log('wow, you are the winner !!')
            this._listener.succeeded.forEach(l => l())
        }
    }

    _setBlock([x, y], type, id=0) {
        this.board[y][x] = { type: type, id: id }
    }
    _getBlock([x, y]) {
        //console.log('get',x,y)
        if (x < 0 || x > this.maxX || y < 0 || y > this.maxY) return undefined
        return this.board[y][x]
    }

    _findPlayerPosition() {
        const y = this.board.findIndex(row => row.some(col => [BOARD.PLAYER, BOARD.TARGET_PLAYER].includes(col.type)))
        const x = this.board[y].findIndex(col => [BOARD.PLAYER, BOARD.TARGET_PLAYER].includes(col.type))
        //console.log(x, y)
        return [x, y]
    }

    _countOpenTargets() {
        const open = this.board.reduce((acc, row) => [
            ...acc, 
            ...row.filter(col => [BOARD.TARGET, BOARD.TARGET_PLAYER].includes(col.type))
        ], [])
        //console.log(open.length)
        return open.length
    }

}
