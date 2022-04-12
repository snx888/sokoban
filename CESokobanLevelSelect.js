import { defineElement, CustomElement } from './base/CustomElement.js'
import sokoban from './Sokoban.js'

defineElement({
    tag: 'ce-sokoban-levelselect',
    data: { progress: {} },
    template: (data) => /*html*/`
        <style>
            :host {
                display: block;
                width: 100%;
                height: 100%;
                max-height: 100%;
                text-transform: uppercase;
                position: relative;
                Xborder: 1px solid green;
                Xbox-sizing: border-box;
            }
            h2 {
                font-size: 20px;
                /*position: relative;
                top: -1.3em;
                left: 2em; */
                flex: 0 0 auto;
            }
            ul {
                list-style-type: none;
                margin: 0;
                padding: 0;
                Xoverflow: auto;
                display: grid;
                grid-template-columns: repeat(5, 1fr)
            }
            li {
                box-sizing: border-box;
                margin: .5em;
                padding: .6em .6em;
                cursor: default;
                border-radius: 5px;
                text-align: center;
                border-right: 5px solid transparent;
                border-left: 5px solid transparent;
                background: var(--surface);
                color: var(--onSurface);
                transition: all 200ms;
                opacity: .8;
                position: relative;
            }
            .container {
                height: 100%;
                overflow: auto;
            }
            .container::-webkit-scrollbar {
                width: 10px;
            }
            .container::-webkit-scrollbar-track {
                background: var(--background); 
            }
            .container::-webkit-scrollbar-thumb {
                background: var(--surfaceDark); 
                border: 3px solid var(--background);
            }
            .container:hover::-webkit-scrollbar-thumb {
                background: var(--surface); 
            }
            .container:hover::-webkit-scrollbar-thumb:hover {
                border: 0;
            }
            li:not(.locked):hover {
                transform: scale(1.1);
                opacity: 1;
            }
            li.solved {
                background: var(--positive);
            }
            li.progress2 {
                background: var(--tertiary);
                color: var(--onTertiary);
            }
            li.progress {
                background: var(--secondary);
                color: var(--onSecondary);
            }
            li.savestate {
                border-left-color: var(--secondary);
            }
            li.locked {
                opacity: .2;
                cursor: not-allowed;
            }
            span {
                font-weight: bold;
                Xcolor: var(--secondary);
            }
            /*li.solved:after {
                content:"solved";
                position: absolute;
                bottom: 0;
                right: -20px;
                border-radius: 10%;
                padding: 0 .3em;
                font-size: .8em;
                transform: rotate(-30deg);
            }*/
            .error {
                margin: 2em auto;
                text-align: center;
                color: var(--negative);
            }
            .loader {
                height: 2em;
                width: 2em;
                position: relative;
            }
            .loader div {
                position: absolute;
                border: 4px solid #fff;
                opacity: 1;
                border-radius: 50%;
                animation: ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
            }
            .loader div:nth-child(2) {
                animation-delay: -0.5s;
            }
            @keyframes ripple {
                0% {
                    top: 1em;
                    left: 1em;
                    width: 0;
                    height: 0;
                    opacity: 1;
                }
                100% {
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                }
            }
            button {
                background: var(--primary);
                color: var(--onPrimary);
                border-radius: 5px;
                border: none;
                padding: .3em .5em;
                font-family: inherit;
                font-size: 16px;
                text-transform: uppercase;
                font-weight: bold;
                text-align: center;
                transition: all 200ms;
                opacity: .8;
                position: fixed;
                right: 1em;
                top: 1em;
            }
            button:not([disabled]):hover {
                transform: scale(1.1);
                opacity: 1;
            }
        </style>
        <button class="reset">reset progress</button>
        <div class="container">
            ${!data.levelpacks ? /*html*/`
                <div class="loader"><div></div><div></div></div>
            ` : data.levelpacks.length===0 ? /*html*/`
                <div class="error">sorry, no maps found :-(</div>
            ` : data.levelpacks.map((pack,p) => /*html*/`
                <h2>${pack.name}</h2>
                <ul>
                    ${pack.level.map((level,l)=> /*html*/`
                        <li pack="${pack.name}" name="${level.name}"
                        class="${level.ranking.data.length>0?'solved':''} 
                        ${level.savestate.state?'savestateXXXXXXXXXXXXXXXXXXXXX':''} 
                        ${level.lock()?'locked':''} 
                        ${level.pack===data.progress.data.pack&&level.name===data.progress.data.name?'progress':''}
                        ${(level.game.moves+level.game.pushes)>0?'progress2':''}"
                        >
                            <span>${level.number}</span>
                        </li>
                    `).join('')}
                </ul>                
            `).join('')}
        </div>
    `,
    on: [
        ['li:not(.locked)', 'click', function(e) {
            sokoban.startGame(this.getAttribute("pack"), this.getAttribute("name"))
            e.stopPropagation()
        }, true],
        ['.reset', 'click', e => {
            sokoban.resetProgress()
            e.stopPropagation()
        }]
    ],
    el: {
        restart: '.restart',
        undo: '.undo'
    },
    class: class extends CustomElement {
        constructor() {
            super()
            this._render()
            sokoban.addEventListener('levelSelect', () => {
                this._render()
            })
            sokoban.addEventListener('progressReset', () => {
                this.update()
            })
            this.update()
        }
        attributeChangedCallback(name, oldValue, newValue) {
            super.attributeChangedCallback(name, oldValue, newValue)
            const disabled = parseInt(this.data.pushes + this.data.moves) === 0
            this._el.restart.disabled = disabled
            this._el.undo.disabled = disabled
        }
        update() {
            //console.log('update')
            sokoban.loadLevels().then(packs => {
                this.data.progress = sokoban.progress
                this.data.levelpacks = packs
                this._render()
            })
        }
    }
})
