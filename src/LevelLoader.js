import levelpacks from './levelpacks.js'
import './Constants.js'
import { BLOCK } from './Constants.js'

//const patternMap = /(^|\n|\r)(\s*)(\#|\#[ \.\@\+\$\*\#]*\#)(\s*)($|\n|\r)/
const BOARD_LINE = /^(\s*)(\#|\#[ \.\@\+\$\*\#]*\#)(\s*)$/
const TITLE_EXIST = /title\:/i
const TITLE = /title\:\s*['"`]?([^'"`]*)['"`]?/i
const IN_BRACKETS = /['"`]([^'"`]*)['"`]/
const ANY_EXCL_COMMENT = /^[;]?\s*(.*)\s*$/
const OUTSIDE = /^[^\#]+|[^\#]+$/g

export default new class {

    listPacks() {
        return levelpacks
    }

    loadPack(name) {
        const url = `./levelpacks/${name}.txt`
        return fetch(url)
            .then(res => res.text())
            .then(text => text.split(/\n|\r/))
            .then(lines => lines.filter(line => !!line))
            .then(lines => {
                //console.log(id.name)
                const levels = [{
                    info: [],
                    board: []
                }]
                let level = 0
                lines.forEach(line => {
                    if (BOARD_LINE.test(line)) {
                        // is map
                        levels[level].board.push(line)
                    }
                    else {
                        // is text
                        if (levels[level].board.length > 0) {
                            // after map
                            levels[++level] = ({
                                info: [],
                                board: []
                            })
                            if (line) levels[level].info.push(line)
                        } else {
                            // before map
                            if (line) levels[level].info.push(line)
                        }
                    }
                })
                const title = 
                    levels[0].info.find(line => line.match(TITLE_EXIST))
                    ? 'before' : 
                    levels[1].info.find(line => line.match(TITLE_EXIST))
                    ? 'after' :
                    ''
                /*console.clear()
                console.log(title)
                console.log(lines)
                console.log(levels)*/
                levels.forEach((level,i) => {
                    if (!level.board.length) {
                        levels.pop()
                        return
                    }
                    if (title === 'after') {
                        level.name = this.#extractLevelName(levels[i+1].info)
                    } else {
                        level.name = this.#extractLevelName(level.info.reverse())
                    }
                    if(level.name) level.name = level.name[1]
                    else level.name = level.id
                })
                /*console.log(levels)
                return JSON.parse(JSON.stringify(levels))*/
                return levels
            })
            .then(levels =>
                new Levelpack(
                    name,
                    url,
                    levels.map(level => new Level(
                        name,
                        level.name,
                        level.board
                )))
            )
    }

    #extractLevelName(info) {
        let name
        info.some(line => {
            name = line.match(TITLE)
            if (name) return true
        })
        if (name) return name
        info.some(line => {
            name = line.match(IN_BRACKETS)
                || line.match(ANY_EXCL_COMMENT)
            if (name) return true
        })
        /*if (name) return name
        info.some(line => {
            name = line.match(ANY_EXCL_COMMENT)
            return true
        })*/
        return name
    }

}

class Levelpack {

    #name
    #url
    #levels

    constructor(name, url, levels) {
        this.#name = name
        this.#url = url
        this.#levels = levels
    }

    get name() { return this.#name }
    get level() { return this.#levels }

    getLevel(name) {
        return this.#levels.find(level => level.name === name)
    }

}

class Level {

    #pack
    #name
    #board = []
    #size

    constructor(pack, name, board) {
        this.#pack = pack
        this.#name = name
        this.#board = board
        this.#setSize()
        this.#harmonize()
    }

    get pack() { return this.#pack }
    get name() { return this.#name }
    get board() { return JSON.parse(JSON.stringify(this.#board)) }
    get size() { return this.#size }

    #setSize() {
        this.#size =  {
            width: Math.max(...this.#board.map(row => row.length)),
            height: this.#board.length
        }
    }

    #harmonize() {
        this.#board.forEach((row,y) => {
            // fill board size
            let times = this.#size.width - row.length
            while (times--) row += BLOCK._OUT
            // flood outer blocks
            this.#board[y] = row.replace(OUTSIDE, match => BLOCK._OUT.repeat(match.length))
        })
    }

}
