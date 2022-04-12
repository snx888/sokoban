import { defineElement, CustomElement } from './base/CustomElement.js'
import './base/hammer.min.js'
import Sokoban from './CMSokoban'

defineElement({
    tag: 'ce-sokoban', 
    data: {
        map: 0,
        moves: 0,
        open: 0
    },
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
            label {
                color: black;
                font-weight: normal;
                margin-right: .3em;
            }
            label:after {
                content: ":";
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
            .board {
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                --block: calc(100vw / 8);
                cursor: pointer;
            }
            .block {
                height: var(--block);
                width: var(--block);
                box-sizing: border-box;
                border: 5px solid transparent;
                display: inline-block;
                background-color: var(--floor);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .block div {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
            }
            .blockW { 
                background-color: var(--wall);
            }
            .blockT,
            .blockp,
            .blockb { 
                border: 5px solid var(--target);
                outline: 5px
                dashed var(--target2);
                outline-offset: -5px;
            }
            .blockP div,
            .blockp div {
                height: 80%;
                width: 80%;
                background-color: var(--player);
                border: 5px solid var(--player2);
                border-radius: 50%;
            }
            .blockB div,
            .blockb div {
                border: 5px solid var(--box);
                background: var(--box2);
            }
        </style>
        <div class="frame XXoriginal">
            <h1>Sokoban<span>VJS</span></h1>
            <h2>Vanilla JS fork</h2>
            <ul>
                <li><label>map</label>${data.map}</li>
                <li><label>moves</label>${data.moves}</li>
                <li><label>open</label>${data.open}</li>
                <li><button class="restart">restart</button></li>
            </ul>
            <div class="board">
            </div>
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
                this.data = this._sokoban.data
            })
            this._sokoban.addEventListener('moved', e => {
                this.data = this._sokoban.data
            })
            this._sokoban.addEventListener('succeeded', e => {
                //this.data = this._sokoban.data
            })
            this._sokoban.loadMap(1)
        }
        _render() {
            super._render()
            if (!this.data.board) return
            this.data.board.forEach(row => {
                // line wrap element
                //this._el.board.appendChild(document.createElement('div'))
                row.forEach(col => {
                    console.log(col)
                    const block = document.createElement('div')
                    block.classList.add('block', 'block'+col.replace(' ', 'E'))
                    block.appendChild(document.createElement('div'))
                    this._el.board.appendChild(block)
                })
            })
            /*let xx = ''
            JSON.parse(JSON.stringify(sokoban.data.board)).forEach(row =>{
                row.forEach(col => {
                    xx = xx + col
                })
                xx = xx + '<br>'
            })
            document.querySelector('pre').innerHTML = xx*/
        }
        _afterRender() {
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
        board: '.board'
    },
    on: [
        ['.restart', 'click', function(e) {
            //console.log(this, e, this._el)
            this._sokoban.restart()
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





