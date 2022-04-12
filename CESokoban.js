import { defineElement, CustomElement } from './base/CustomElement.js'
import './CESokobanGame.js'
import './CESokobanLevelSelect.js'
import { STATE } from './Constants.js'
import sokoban from './Sokoban.js'



defineElement({
    tag: 'ce-sokoban', 
    template: (data) => /*html*/`
        <style>
            :host {
                --floor: cornsilk;
                --wall: Sienna;
                --target: LightSalmon;
                --worker: steelblue;
                --worker2: skyblue;
                --box: Peru;
                --box2: tan;

                --background: #111;
                --onBackground: white;
                --surface: #2E2E2E;
                --onSurface: lightgray;
                --surfaceDark: #1f1f1f;
                --primary: #198EBF;
                --onPrimary: white;
                --secondary: #FFCC00;
                --onSecondary: #494949;
                --tertiary: #7A6200;
                --onTertiary: lightgray;
                --positive: seagreen;
                --negative: indianred;

                font: 16px 'Patrick Hand';
                letter-spacing: 1px;
                display: block;
                height: 100%;
                background-color: var(--background);
                color: var(--onBackground);
            }
            .frame {
                display: flex;
                flex-direction: column;
                height: 100%;
                position: relative;
            }
            header {
            }
            section {
                flex: 1;
                min-height: 0;
            }
            h1 {
                font-family: 'Kaushan Script';
                font-size: 24px;
                font-weight: bold;
                letter-spacing: .2em;
                text-transform: uppercase;
                text-align: center;
                margin: 1em 0;
                Xborder-bottom: 2px solid var(--primary);
            }
            h1:after {
                content: "vanilla";
                background: #F3E5AB;
                color: #462E1C;
                font-family: 'Patrick Hand';
                font-size: 11px;
                letter-spacing: .1em;
                Xfont-weight: normal;
                Xborder-radius: 3px;
                padding: 0 3px;
                position: relative;
                top: 18px;
                right: 50px;
            }
            h1 span {
                color: var(--background);
                display: inline-block;
                letter-spacing: 0;
                font-size: 16px;
                line-height: 24px;
                transform: translateY(-3px);
                padding: 2px 8px;
                margin-left: .3em;
                background: var(--onBackground);
                border-top-right-radius: 5px;
                border-bottom-right-radius: 5px;
                display: none;
            }
            h2 {
                display: none;
            }
            h3 {
            }
            button {
                background: var(--primary);
                color: var(--onPrimary);
                border-radius: 5px;
                border: none;
                cursor: pointer;
                padding: .3em .5em;
                font-family: inherit;
                font-size: 16px;
                text-transform: uppercase;
                font-weight: bold;
                text-align: center;
            }
            button:hover{
                Xtransform: translate(1px, 1px);
                Xbox-shadow: -2px -2px black;
            }
            .info {
                box-sizing: border-box;
                color: white;
                padding: 1em;
                position: fixed;
                background: rgba(0, 0, 0, .9);
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                text-align: center;
            }
            .hidden {
                display: none;
            }
            .failure {
                border:2px solid red;
            }
            .success {
                border:2px solid green;
            }
        </style>
        <div class="frame">
            <header>
                <h1>Sokoban<span>VJS</span></h1>
                <h2>Vanilla JS fork</h2>
            </header>
            <section>
                <ce-sokoban-levelselect></ce-sokoban-levelselect>
                <ce-sokoban-game class="hidden"></ce-sokoban-game>
                <div class="info success hidden">
                    <h3>Level solved</h3>
                    <p>Congratulations, you solved this level. What's next?</p>
                    <button class="restart">same</button>
                    <button class="next">next</button>
                    <button class="random">random</button>
                </div>
                <div class="info failure hidden">
                    <h3>Failure</h3>
                    <p>Unfortunately you failed to solve this level. What's next?</p>
                    <button class="restart">same</button>
                    <button class="next">next</button>
                    <button class="random">random</button>
                </div>
            </section>
        </div>
    `,
    class: class extends CustomElement {
        constructor() {
            super()
            sokoban.addEventListener('gameStart', game => {
                game.addEventListener('update', game => {
                    if (game.state === STATE.SOLVED){
                        //this._el.success.classList.remove('hidden')
                    } else if (game.state === STATE.LOCKED){
                        //this._el.failure.classList.remove('hidden')
                    } else if (game.state === STATE.ERROR){
                        //TODO
                    }
                })
                this._el.game.classList.remove('hidden')
                this._el.levelselect.classList.add('hidden')
            })
            sokoban.addEventListener('levelSelect', () => {
                this._el.game.classList.add('hidden')
                this._el.levelselect.classList.remove('hidden')
            })
        }
    },
    el: {
        success: '.success',
        failure: '.failure',
        game: 'ce-sokoban-game',
        levelselect: 'ce-sokoban-levelselect'
    },
    on: [
        ['ce-sokoban-nav', 'levelChange', function(e) {
            this._sokoban = Sokoban.loadLevel(e.detail)
            this._el.game.model = this._sokoban
            e.stopPropagation()
        }],
        ['.restart', 'click', function(e) {
            this._sokoban.restart()
            e.stopPropagation()
        }],
        ['.random', 'click', function(e) {
            this._sokoban.randomMap()
            e.stopPropagation()
        }],        
        ['.next', 'click', function(e) {
            this._sokoban.nextMap()
            e.stopPropagation()
        }]
    ]
})





