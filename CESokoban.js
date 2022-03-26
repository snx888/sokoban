import { defineElement, CustomElement } from './base/CustomElement.js'

defineElement({
    tag: 'ce-sokoban', 
    data: {
        map: 0,
        moves: 0,
        goals: 0
    },
    template: (data) => /*html*/`
        <style>
            .board {
                border: 1px solid red;
            }
        </style>
        <div class="frame">
            <ul>
                <li>map: ${data.map}</li>
                <li>moves: ${data.moves}</li>
                <li>goals: ${data.goals}</li>
            </ul>
            <div class="board">
                <slot></slot>
            </div>
        </div>
    `,
    class: class extends CustomElement {
        set title(v) {
            this.data.title = v
        }
        get title() {
            return this.data.title
        }
    },
    /*el: {
        button: 'button'
    },
    on: [
        ['button', 'click', function(e) {
            //console.log(this, e, this._el.button)
            this.data.count++
            e.stopPropagation()
        }]
    ]*/
})
