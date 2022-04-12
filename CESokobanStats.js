import { defineElement, CustomElement } from './base/CustomElement.js'
import sokoban from './Sokoban.js'

defineElement({
    tag: 'ce-sokoban-stats',
    attributes: ['pushes', 'moves', 'todo', 'pack', 'level', 'number'],
    template: (data) => /*html*/`
        <style>
            :host {
                display: block;
            }
            ul {
                margin: 0;
                padding: 5px;
                list-style-type: none;
                display: flex;
                justify-content: center;
                align-items: center;
                XXgap: 2em;
            }
            li, div {
                flex: 1 1 auto;
                padding: .5em .3em;
                text-transform: uppercase;
                text-align: center;
            }        
            label {
                color: var(--onBackground);
                font-weight: normal;
                margin-right: .3em;
            }
            label:after {
                content: ":";
            }
            span {
                color: var(--secondary);
                font-weight: bold;
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
            }
            button[disabled] {
                opacity: .3;
            }
            button:not([disabled]):hover {
                transform: scale(1.1);
                opacity: 1;
            }
        </style>
        <ul>
            <li><label>level</label><span>${data.pack} #${data.number}</span> (${data.level})</li>
            <li><button class="switch">switch</button></li>
        </ul>
        <ul>
            <li><label>moves</label><span>${data.moves}</span></li>
            <li><label>pushes</label><span>${data.pushes}</span></li>
            <!--<li><label>todo</label><span>${data.todo}</span></li>-->
            <li><button class="undo">undo</button></li>
            <li><button class="restart">restart</button></li>
        </ul>
    `,
    on: [
        ['.restart', 'click', () => { sokoban.game.restart() }],
        ['.switch', 'click', () => { sokoban.selectLevel() }],
        ['.undo', 'click', () => { 
            //console.log(sokoban.game)
            sokoban.game.undo() }],
    ],
    el: {
        restart: '.restart',
        undo: '.undo'
    },
    class: class extends CustomElement {
        attributeChangedCallback(name, oldValue, newValue) {
            super.attributeChangedCallback(name, oldValue, newValue)
            this._render()
            const disabled = parseInt(this.data.pushes + this.data.moves) === 0
            this._el.restart.disabled = disabled
            this._el.undo.disabled = disabled
        }
        _afterRender() {
        }
    }
})
