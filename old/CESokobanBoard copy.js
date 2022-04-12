import { defineElement, CustomElement } from './base/CustomElement.js'
import sokoban from './Sokoban.js'

defineElement({
    tag: 'ce-sokoban-board',
    data: { blocks: [], size: {}, ratio: '100%' },
    template: (data) => /*html*/`
        <style>
            :host{
                border: 2px solid green;
                display: block;
                width: 100%;
                Xheight: 100%;
                padding-bottom: ${data.ratio};
                cursor: move;
                position: relative;
                box-sizing: border-box;
                overflow:hidden;
            }
            .board {
                position: absolute;
                top: 0;
                width: 100%;
                height: 100%;
                border: 1px solid red;
            }
            .row {
                position: relative;
                width: 100%;
                height: calc(100% / ${data.size.height}); 
            }
            .block {
                box-sizing: border-box;
                float: left;
                transition: 300ms all;
                color: transparent;
                border: 1px solid black;
                width: calc(100% / ${data.size.width});
                height: 100%;
            }
            /*.out {
                //background-color: blue;
            }
            .floor {
                background-color: var(--floor);
            }
            .wall { 
                background-color: var(--wall);
            }
            .target { 
                background-color: var(--target);
                border: 5px solid var(--floor);
                border-radius: 50%;
            }
            .worker {
                background-color: var(--worker);
                border: 5px solid var(--floor);
                border-radius: 50%;
            }
            .box {
                border: 5px solid var(--box);
                background: var(--box2);
            }
            .box.target {
                opacity: .7;
                border-radius: 0;
            }
            .box.lock{
                border-color:red;
            }
            .worker.target {
                opacity: .7;
            }*/
        </style>
        <div class="board">
            ${data.blocks.map((row, y) => /*html*/`
                <div class="row">
                    ${row.map((block, x) => {
                        return /*html*/`
                            <div class="block ${block.type}">
                                <!--${block.char}-->
                            </div>
                        `
                    }).join('')}
                </div>
            `
            ).join('')}
        </div>
    `,
    class: class extends CustomElement {
        constructor() {
            super()
            sokoban.addEventListener('game', game => {
                this.data.ratio = ((sokoban.level.size.height / sokoban.level.size.width) * 100) + '%'
                this.data.size = sokoban.level.size
                this.data.blocks = sokoban.game.blocks
                //this.data.blocks = JSON.parse(JSON.stringify(sokoban.game.blocks))
                game.addEventListener('update', game => {
                    // required cause the object is renewed
                    // by using UNDO so the reactiveness won't work
                    this.data.blocks = sokoban.game.blocks
                    //console.log('update')
                    //this.data.blocks = JSON.parse(JSON.stringify(sokoban.game.blocks))
                })           
            })
        }
    }
})
