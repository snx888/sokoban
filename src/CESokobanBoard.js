import { defineElement, CustomElement } from './base/CustomElement.js'
import sokoban from './Sokoban.js'
import { STATE } from './Constants.js'

defineElement({
    tag: 'ce-sokoban-board',
    data: { blocks: [], size: {} },
    template: (data) => /*html*/`
        <style>
            :host{
                cursor: move;
                position: relative;
                height: 100%;
                weight: 100%;
                Xdisplay: block;
            }
            .board {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                max-width: 100%;
                max-height: 100%;
                aspect-ratio: ${data.size.width} / ${data.size.height};
                margin: auto;
                display: grid;
                grid-template-columns: repeat(${data.size.width}, 1fr);
                background: url('./skins/Sokoban.svg#floor') repeat left top;
                background-size: 64px 64px;
            }
            .block {
                /*display: inline-block;
                Xwidth: calc(100% / ${data.size.width});
                width: ${data.size.width}fr;
                height: 100%;*/
                box-sizing: border-box;
                Xborder: 2px solid black;
                background-repeat: no-repeat;
                Xbackground-size: 10% 10%;
                Xbackground-position: 0 0;
                
            }
            .out {
                background-color: var(--background);
            }
            .floor {
                Xbackground-color: var(--floor);
                background-image: url('./skins/Sokoban.svg#floor');
            }
            .wall { 
                Xbackground-color: var(--wall);
                background-image: url('./skins/Sokoban.svg#wall');

            }
            .target { 
                Xbackground-color: var(--target);
                Xborder: 5px solid var(--floor);
                Xborder-radius: 50%;
                background-image: url('./skins/Sokoban.svg#target');
            }
            .worker {
                Xbackground-color: var(--worker);
                Xborder: 5px solid var(--floor);
                Xborder-radius: 50%;
                background-image: url('./skins/Sokoban.svg#worker');
            }
            .box {
                Xborder: 5px solid var(--box);
                Xbackground: var(--box2);
                background-image: url('./skins/Sokoban.svg#box');

            }
            .box.target {
                Xopacity: .7;
                Xborder-radius: 0;
                background-image: url('./skins/Sokoban.svg#box-target');
            }
            .box.lock{
                Xborder-color:red;
                background-image: url('./skins/Sokoban.svg#box-lock');
            }
            .worker.target {
                Xopacity: .7;
            }
            .info {
                box-sizing: border-box;
                color: white;
                padding: 1em;
                position: absolute;
                background: rgba(0, 0, 0, .4);
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2em;
            }
            .info svg {
                transform: scale(2);
            }
            .info span {
                background: black;
                padding: .2em .4em;
                text-transform: uppercase;
            }
            .hidden {
                display: none;
            }
            :focus{
                outline: none;
            }
        </style>
        <div class="board" tabindex="0">
            ${data.blocks.map((row, y) => /*html*/`
                <!--<div class="row">-->
                    ${row.map((block, x) => {
                        return /*html*/`
                            <div class="block ${block.type}">
                                <!--${block.char}-->
                            </div>
                        `
                    }).join('')}
                <!--</div>-->
            `
            ).join('')}
        </div>
        <div class="info success hidden">
            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="48px" height="48px"><path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"/><path fill="#ccff90" d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z"/></svg>
            <span>nice work, you solved this level..</span>
        </div>
        <div class="info failure hidden">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 122.88" width="48px" height="48px" style="enable-background:new 0 0 122.88 122.88" xml:space="preserve"><style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;fill:#FBD433;} .st1{fill-rule:evenodd;clip-rule:evenodd;fill:#141518;}</style><g><path class="st0" d="M45.54,2.11c32.77-8.78,66.45,10.67,75.23,43.43c8.78,32.77-10.67,66.45-43.43,75.23 c-32.77,8.78-66.45-10.67-75.23-43.43C-6.67,44.57,12.77,10.89,45.54,2.11L45.54,2.11z"/><path class="st1" d="M45.78,32.27c4.3,0,7.78,5.05,7.78,11.27c0,6.22-3.48,11.27-7.78,11.27c-4.3,0-7.78-5.05-7.78-11.27 C38,37.32,41.48,32.27,45.78,32.27L45.78,32.27z M28.12,94.7c16.69-21.63,51.01-21.16,65.78,0.04l2.41-2.39 c-16.54-28.07-51.56-29.07-70.7-0.15L28.12,94.7L28.12,94.7z M77.1,32.27c4.3,0,7.78,5.05,7.78,11.27c0,6.22-3.48,11.27-7.78,11.27 c-4.3,0-7.78-5.05-7.78-11.27C69.31,37.32,72.8,32.27,77.1,32.27L77.1,32.27z"/></g></svg>
            <span>oh no! unfortunately you failed..</span>
        </div>
        <div class="info error hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width="48px" height="48px" viewBox="0 0 20 20"><path fill="#CD5C5C" d="M11.53 2.3A1.85 1.85 0 0 0 10 1.21 1.85 1.85 0 0 0 8.48 2.3L.36 16.36C-.48 17.81.21 19 1.88 19h16.24c1.67 0 2.36-1.19 1.52-2.64zM11 16H9v-2h2zm0-4H9V6h2z"/></svg>
            <span>map error</span>
        </div>
    `,
    el: {
        success: '.success',
        failure: '.failure',
        error: '.error',
        board: '.board'
    },
    class: class extends CustomElement {
        constructor() {
            super()
            sokoban.addEventListener('gameStart', game => {
                this.data.size = game.level.size
                this.data.blocks = game.blocks
                this._render()
                //console.log(game.state)
                if (game.state === STATE.ERROR) {
                    this._el.error.classList.remove('hidden')
                } else if (game.state === STATE.LOCKED){
                    this._el.failure.classList.remove('hidden')
                }
                //this.data.blocks = JSON.parse(JSON.stringify(sokoban.game.blocks))
                game.addEventListener('update', game => {
                    // required cause the object is renewed
                    // by using UNDO so the reactiveness won't work
                    this.data.blocks = sokoban.game.blocks
                    this._render()
                    //console.log('update')
                    //this.data.blocks = JSON.parse(JSON.stringify(sokoban.game.blocks))
                    if (game.state === STATE.SOLVED) {
                        this._el.success.classList.remove('hidden')
                    } else if (game.state === STATE.LOCKED){
                        this._el.failure.classList.remove('hidden')
                    }
                })           
            })
        }
        _afterRender() {
            this._el.board.focus()
        }
    }
})
