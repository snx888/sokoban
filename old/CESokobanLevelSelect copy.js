import { defineElement, CustomElement } from './base/CustomElement.js'
import sokoban from './Sokoban.js'

defineElement({
    tag: 'ce-sokoban-levelselect',
    data: { history: [], levels: [] },
    template: (data) => /*html*/`
        <style>
            :host {
                display: block;
                width: 100%;
                height: 100%;
                text-transform: uppercase;
                position: relative;
                Xborder: 1px solid green;
                Xbox-sizing: border-box;
                display: flex;
                align-items: justify;
            }
            div {
                width: 1fr;
                flex: 1 1 50%;
                Xborder: 1px solid green;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            h2 {
                font: 20px Calibri;
                text-align: center;
                /*position: relative;
                top: -1.3em;
                left: 2em; */
                flex: 0 0 auto;
            }
            .container {
                flex: 1 1 auto;
                position: relative;
            }
            ul {
                list-style-type: none;
                margin: 0;
                padding: 0;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                Xborder: 1px solid red;
                overflow: auto;
            }
            li {
                padding: .6em .6em;
                cursor: pointer;
            }
            .pack {
                font-size: .9em;
            }
            .name {
                font-weight: bold;
                color: var(--secondary);
            }
            .state {
                border-radius: 10%;
                padding: 0 .3em;
                float: right;
                font-size: .9em;
            }
            .state.solved {
                background: seagreen;
            }
            .state.open {
                background: dimgray;
            }

            .levels ul {
            }
        </style>
        <div class="history">
            <h2>Recently played</h2>
            <div class="container">
                <ul>
                    ${data.history.map((item,i)=> /*html*/`
                        <li item="${i}">
                            <span class="pack">${item.pack}</span>
                            <span class="name">${item.name}</span>
                            <span class="state${item.solved?' solved':' open'}">${item.solved?'solved':'open'}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
        <div class="levels">
            <h2>All level</h2>
            <div class="container">
                <ul>
                    ${data.levels.map((item,i)=> /*html*/`
                        <li item="${i}">
                            <span class="pack">${item.pack}</span>
                            <span class="name">${item.name}</span>
                            <!--<span class="state${item.solved?' solved':' open'}">${item.solved?'solved':'open'}</span>-->
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `,
    on: [
        ['.history li', 'click', function(e) {
            const level = sokoban.history.data[parseInt(this.getAttribute("item"))]
            //console.log(sokoban.history.data, parseInt(this.getAttribute("item")))
            sokoban.startGame(level.pack, level.name)
            e.stopPropagation()
        }, true],
        ['.levels li', 'click', function(e) {
            const level = sokoban.levelpack.level[parseInt(this.getAttribute("item"))]
            //console.log(sokoban.levelpack, parseInt(this.getAttribute("item")))
            sokoban.startGame(level.pack, level.name)
            e.stopPropagation()
        }, true]
    ],
    el: {
        restart: '.restart',
        undo: '.undo'
    },
    class: class extends CustomElement {
        constructor() {
            super()
            this.data.history = sokoban.history.data
            sokoban.loadLevels().then(levels => {
                this.data.levels = levels
            })
            //TODO level solv info via ranking
            //TODO level savestate info (own colored info if available)
        }
        attributeChangedCallback(name, oldValue, newValue) {
            super.attributeChangedCallback(name, oldValue, newValue)
            const disabled = parseInt(this.data.pushes + this.data.moves) === 0
            this._el.restart.disabled = disabled
            this._el.undo.disabled = disabled
        }
    }
})
