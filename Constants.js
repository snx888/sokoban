export const BLOCK = {
    FLOOR: ' ',
    WALL: '#',
    TARGET: '.',
    WORKER: '@',
    BOX: '$',
    TARGET_BOX: '*',
    TARGET_WORKER: '+',
    _BOX_LOCK: '!', //special
    _OUT: '_' //special
}

export const STATE = {
    ERROR: -1,
    INITIAL: 0,
    ONGOING: 1,
    SOLVED: 2,
    LOCKED: 3
}

export const MOVE = {
    LEFT: 'l',
    RIGHT: 'r',
    UP: 'u',
    DOWN: 'd',
    LEFT_PUSH: 'L',
    RIGHT_PUSH: 'R',
    UP_PUSH: 'U',
    DOWN_PUSH: 'D'
}

export const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
}
export const DIFF = {}
DIFF[DIRECTION.LEFT] = { x: -1, y: 0 }
DIFF[DIRECTION.RIGHT] = { x: 1, y: 0 }
DIFF[DIRECTION.UP] = { x: 0, y: -1 }
DIFF[DIRECTION.DOWN] = { x: 0, y: 1 }

export const X = 0
export const Y = 1
