import { defineElement, CustomElement } from './base/CustomElement.js'
import './base/hammer.min.js'
import Sokoban, { BOARD } from './CMSokoban'

defineElement({
    tag: 'ce-sokoban-nav',
    data: {
        levelpacks: [],
        levels: []
     },
    template: (data) => /*html*/`
        <div>
            <label for="levelpack">Levelpack</label>
            <select id="levelpack">
                ${data.levelpacks.map(pack => `<option value="${pack.id}">${pack.name}</option>`).join('')}
            </select>
        </div>
        <div>
            <label for="level">Level</label>
            <select id="level">
                ${data.levels.map(level => `<option value="${level.id}">${level.name}</option>`).join('')}
            </select>
        </div>
    `,
    class: class extends CustomElement {
        constructor() {
            super()
            Sokoban.loadLevelPacks()
                .then(packs => this.data.levelpacks = packs)
            //console.log(this.data.levelpacks)
        }
    },
    on: [
        ['#levelpack', 'change', function(e) {
            //console.log(e.target.selectedIndex)
            Sokoban.loadLevels(this.data.levelpacks.filter(pack => pack.id === e.target.selectedIndex)[0])
                .then(levels => this.data.levels = levels)
        }],
        ['#level', 'change', function(e) {
            //console.log(e.target.selectedIndex, this.data.levels)
            this.dispatchEvent(new CustomEvent('levelChange', { detail:
                this.data.levels.filter(level => level.id === e.target.selectedIndex)[0]
            }))
        }]
    ]
})

defineElement({
    tag: 'ce-sokoban-stats',
    attributes: ['map', 'moves', 'open'],
    template: (data) => /*html*/`
        <style>
            ul {
                XXmargin: 0;
                padding: 5px;
                display: flex;
                list-style-type: none;
                justify-content: center;
                align-items: center;
                XXgap: 2em;
            }
            li {
                flex: 1 1 0;
                padding: .5em .3em;
                text-transform: uppercase;
                color: var(--box2);
                font-weight: bold;
                text-align: center;
            }        
            label {
                color: black;
                font-weight: normal;
                margin-right: .3em;
            }
            label:after {
                content: ":";
            }
        </style>
        <ul>
            <li><label>map</label>${data.map}</li>
            <li><label>moves</label>${data.moves}</li>
            <li><label>open</label>${data.open}</li>
            <li><button class="restart">restart</button></li>
        </ul>
    `
})

defineElement({
    tag: 'ce-sokoban-board',
    data: { board: [], maxX: 1 },
    template: (data) => /*html*/`
        <style>
            .board {
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                --block: calc(100vw / ${data.maxX});
                cursor: pointer;
                position: relative;
            }
            .block {
                height: var(--block);
                width: var(--block);
                box-sizing: border-box;
                border: 5px solid transparent;
                display: inline-block;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .blockF {
                background-color: var(--floor);
            }
            .blockW { 
                background-color: var(--wall);
            }
            .blockT { 
                border: 5px solid var(--target);
                outline: 5px
                dashed var(--target2);
                outline-offset: -5px;
            }
            .block.move {
                position: absolute;
                transition: 300ms all;
            }
            .block div {
                height: 100%;
                width: 100%;
                box-sizing: border-box;
            }
            .blockP div {
                height: 80%;
                width: 80%;
                background-color: var(--player);
                border: 5px solid var(--player2);
                border-radius: 50%;
            }
            .blockB div {
                border: 5px solid var(--box);
                background: var(--box2);
            }        
        </style>
        <div class="board">
            ${data.board.map(row => 
                row.map(col => {
                let type = [BOARD.PLAYER, BOARD.BOX].includes(col.type)
                    ? BOARD.FLOOR
                    : [BOARD.TARGET_PLAYER, BOARD.TARGET_BOX].includes(col.type)
                        ? BOARD.TARGET
                        : col.type
                return /*html*/`
                    <div class="block block${type.replace(' ', 'F')}">
                    </div>
                `
            }).join('')).join('')}
            ${data.board.map(row => 
                row.map(col => col.id > 0 ? /*html*/`
                        <div class="block move block${col.type.replace('b', 'B').replace('p', 'P')}" id="soko-${col.id}">
                            <div></div>
                        </div>
                    `
                    : ''
            ).join('')).join('')}
        </div>
    `,
    class: class extends CustomElement {
        initialize(board, maxX) {
            this.data.board = JSON.parse(JSON.stringify(board))
            this.data.maxX = maxX
            this.update(board)
        }
        update(board) {
            console.log(board)
            board.map((row,y) => row.map((col,x) => {
                if (col.id > 0) {
                    const o = this._el[`soko-${col.id}`]
                    o.style.left = o.offsetWidth * x + 'px'
                    o.style.top = o.offsetHeight * y + 'px'
                    //console.log(col.id, o.offsetWidth * x + 'px')
                }
            }))
        }
        _afterRender() {
            this.data.board.reduce((acc, row) => [...acc, ...row.filter(col => col.id > 0)], []).forEach(i => {
                this._el[`soko-${i.id}`] = this.shadowRoot.querySelector(`#soko-${i.id}`)
            })
        }
    }
})

defineElement({
    tag: 'ce-sokoban', 
    template: (data) => /*html*/`
        <style>
            :host {
                --floor: cornsilk;
                --wall: tan;
                --target: gold;
                --target2: SlateGray;
                --player: steelblue;
                --player2: skyblue;
                --box: SaddleBrown;
                --box2: Sienna;
                font: 16px Consolas;
            }
            .original {
                --floor: #DED6AE;
                --wall: #A19555;
                --target: #D69585;
                --target2: #BD8375;
                --player: #2895FF;
                --player2: #996D40;
                --box: #BA650C;
                --box2: #9E560A;
            }
            .first {
                --floor: cornsilk;
                --wall: tan;
                --target: gold;
                --target2: black;
                --player: steelblue;
                --player2: skyblue;
                --box: darkred;
                --box2: firebrick;
            }
            .frame {
                background: var(--floor);
            }
            h1 {
                font: 24px Consolas;
                font-weight: bold;
                letter-spacing: .2em;
                text-transform: uppercase;
                text-align: center;
                margin: 0;
                padding-top: 1em;
            }
            h1 span {
                color: var(--box2);
                display: inline-block;
                letter-spacing: 0;
                font-size: 16px;
                line-height: 24px;
                transform: translateY(-3px);
                padding: 2px 8px;
                background: var(--wall);
                border-top-right-radius: 5px;
                border-bottom-right-radius: 5px;
            }
            h2 {
                margin: 0;
                font: 13px Calibri;
                color: var(--wall);
                text-align: center;
                /*position: relative;
                top: -1.3em;
                left: 2em; */
            }
            h3 {

            }
            button {
                background: var(--wall);
                border-radius: 5px;
                border: none;
                cursor: pointer;
                padding: .3em .5em;
                font: 16px Consolas;
                text-transform: uppercase;
                color: var(--box2);
                font-weight: bold;
                text-align: center;
            }
            button:hover{
                Xtransform: translate(1px, 1px);
                Xbox-shadow: -2px -2px black;
            }
            .success {
                color: white;
                padding: 1em;
                position: fixed;
                background: rgba(0, 0, 0, .9);
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                text-align: center;
                display: none;
            }
        </style>
        <div class="frame XXoriginal">
            <h1>Sokoban<span>VJS</span></h1>
            <h2>Vanilla JS fork</h2>
            <ce-sokoban-nav></ce-sokoban-nav>
            <ce-sokoban-stats map="0" moves="0" open="0"></ce-sokoban-stats>
            <ce-sokoban-board></ce-sokoban-board>
            <div class="success">
                <h3>Level solved</h3>
                <p>Congratulations, you solved this level. What's next?</p>
                <button class="restart">same</button>
                <button class="next">next</button>
                <button class="random">random</button>
            </div>
        </div>
    `,
    class: class extends CustomElement {
        _sokoban
        _keydown = false
        constructor() {
            super()
            this._sokoban = new Sokoban()
            this._sokoban.addEventListener('started', e => {
                this._el.success.style.display = 'none'
                this._el.stats.data = {
                    moves: this._sokoban.moves,
                    open: this._sokoban.open,
                    map: this._sokoban.map
                }
                this._el.board.initialize(this._sokoban.board, this._sokoban.maxX)
            })
            this._sokoban.addEventListener('moved', e => {
                this._el.stats.data = {
                    moves: this._sokoban.moves,
                    open: this._sokoban.open,
                    map: this._sokoban.map
                }
                this._el.board.update(this._sokoban.board)
            })
            this._sokoban.addEventListener('succeeded', e => {
                console.log('succ')
                this._el.success.style.display = 'block'
            })
            this._sokoban.loadMap(0)
        }
        _afterRender() {
            /*this._el.stats.setAttribute('moves', this._sokoban.moves)
            this._el.stats.setAttribute('open', this._sokoban.open)
            this._el.stats.setAttribute('map', this._sokoban.map)*/
            /*this._el.stats.data = {
                moves: this._sokoban.moves,
                open: this._sokoban.open,
                map: this._sokoban.map
            }*/
            //this._el.board.data = this._sokoban.board
            const hammer = new Hammer(this._el.board)
            hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
            hammer.on("swipe", (e) => {
                //console.log(e)
                switch(e.direction) {
                    case 8: this._sokoban.move('up')
                        break
                    case 16: this._sokoban.move('down')
                        break
                    case 2: this._sokoban.move('left')
                        break
                    case 4: this._sokoban.move('right')
                        break
                }
            })
        }
    },
    el: {
        success: '.success',
        stats: 'ce-sokoban-stats',
        board: 'ce-sokoban-board',
        nav: 'ce-sokoban-nav'
    },
    on: [
        ['ce-sokoban-nav', 'levelChange', function(e) {
            //console.log(this, e, e.detail)
            this._sokoban.loadLevel(e.detail)
                .then(level => {

                })
            e.stopPropagation()
        }],
        ['.restart', 'click', function(e) {
            //console.log(this, e, this._el)
            this._sokoban.restart()
            e.stopPropagation()
        }],
        ['.random', 'click', function(e) {
            //console.log(this, e, this._el)
            this._sokoban.randomMap()
            e.stopPropagation()
        }],        
        ['.next', 'click', function(e) {
            //console.log(this, e, this._el)
            this._sokoban.nextMap()
            e.stopPropagation()
        }],
        [document, 'keydown', function(e) {  
            if (this._keydown !== false) return
            this._keydown = true
            //console.log(e) 
            switch(e.key) {
                case 'w':
                case 'ArrowUp': this._sokoban.move('up')
                    break
                case 's':
                case 'ArrowDown': this._sokoban.move('down')
                    break
                case 'a':
                case 'ArrowLeft': this._sokoban.move('left')
                    break
                case 'd':
                case 'ArrowRight': this._sokoban.move('right')
                    break
            }
            e.stopPropagation()
        }],
        [document, 'keyup', function(e) {
            this._keydown = false
        }]
    ]
})





