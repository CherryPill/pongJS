let paths = {
    soundsBasePath: "assets/audio/",
    iconsBasePath: "assets/icons/"
};

const browserWindowWidth = window.innerWidth;
const browserWindowHeight = window.innerHeight;

const COLOR_RGB_MAX_VAL = 255;

let directionVars = {
    DIR_X_LEFT: -1,
    DIR_X_RIGHT: 1,
    DIR_Y_UP: -1,
    DIR_Y_DWN: 1
};

let gameModes = {
    SINGLE_PLAYER: 0,
    MULTI_PLAYER: 1
};

let gameState = {
    gameMode: gameModes.SINGLE_PLAYER,
    paused: false,
    soundEnabled: true,
    soundPanel: document.getElementById("sound"),
    overLay: document.getElementById("overlay"),
    pausedMessage: document.getElementById("paused"),
    toggleFreezeGame: function () {
        this.paused = !this.paused;
        this.pausedMessage.style.visibility = this.paused ? "visible" : "hidden";
    },
    setUpPosition: function () {
        this.overLay.style.zIndex = 1;
        this.pausedMessage.style.left = playingField.viewPortWidth / 2 - 100 + "px";
        this.pausedMessage.style.top = playingField.viewPortHeight / 2 - 80 + "px";
    },
    hideOverlay: function () {
        this.overLay.style.visibility = "hidden";
    },
    toggleSound: function () {
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled) {
            this.soundPanel.src = paths.iconsBasePath + "sound_on.png";
        } else {
            this.soundPanel.src = paths.iconsBasePath + "sound_off.png";
        }
    }
};

let mainMenu = {
    menuWindow: {
        htmlElement: document.getElementById("menu"),
        width: 150,
        height: 50
    },
    startSingle: document.getElementById("sp"),
    startMulti: document.getElementById("mp"),
    showWindow: function () {
        this.menuWindow.htmlElement.style.top = browserWindowHeight / 4 - this.menuWindow.height / 2 + "px";
        this.menuWindow.htmlElement.style.left = browserWindowWidth / 2 - this.menuWindow.width / 2 + "px";
        this.menuWindow.htmlElement.style.zIndex = 2;
        this.startSingle.addEventListener("click", function () {
            commenceGame(gameModes.SINGLE_PLAYER);
        });
        this.startMulti.addEventListener("click", function () {
            commenceGame(gameModes.MULTI_PLAYER);
        })
    },
    hideWindow: function () {
        this.menuWindow.htmlElement.style.visibility = "hidden";
    }
};

let colors = {
    getRandomColor: function () {
        return `rgb(${getRandomNum(100, COLOR_RGB_MAX_VAL)}, 
        ${getRandomNum(100, COLOR_RGB_MAX_VAL)}, 
        ${getRandomNum(100, COLOR_RGB_MAX_VAL)})`;
    }
};

let scores = {
    player: 0,
    bot: 0,
    playerUI: document.getElementById("playerScore"),
    botUI: document.getElementById("botScore"),
    update: function () {
        this.playerUI.innerHTML = this.player;
        this.botUI.innerHTML = this.bot;
    }
};

let soundEffects = {
    soundTypes: {
        BALL_HIT_RACKET: 0, ROUND_LOST: 1, ROUND_WON: 2
    },
    availableSounds: ["ball_hit_racket.mp3", "round_lost.mp3", "round_won.mp3"],
    playSound: function (soundType) {
        if (gameState.soundEnabled) {
            new Audio(paths.soundsBasePath + this.availableSounds[soundType]).play();
        }
    }
};

let controlKey = {
    LEFT: 37,
    RIGHT: 39,
    ESC: 27,
    WASD_A: 65,
    WASD_D: 68
};

let pressedKeys = {
    LEFT_PRESSED: false,
    RIGHT_PRESSED: false,
    WASD_A_PRESSED: false,
    WASD_D_PRESSED: false
};

let playingField = {
    viewPortWidth: 0,
    viewPortHeight: 0,
    leftX: 0,
    rightX: 0,
    topY: 0,
    w: 700,
    h: 500,
    e: document.getElementById("field")
};

let botCollisionWithBorder = {
    borderRight: 0,
    borderLeft: 1,
    noCollision: 2
};

let collision = {
    withBot: 0,
    withPlayer: 1,
    withWestWall: 2,
    withEastWall: 3,
    withNorthWall: 4,
    withSouthWall: 5
};

//moving mode: -1 - west, 0 - stationary, 1 - east
let playerInstance = {
    w: 126,
    h: 26,
    defaultPosX: playingField.w / 2 - 126 / 2,
    x: playingField.w / 2 - 126 / 2,
    y: 350,
    time: 0,
    directionX: 0,
    e: document.getElementById("player"),
    move: function (dir) {
        this.directionX = dir;
        let delta = (10 * dir);
        let newPos = playerInstance.x + delta;
        if (!detectCollisionPanelField(newPos)) {
            playerInstance.e.style.left = newPos + "px";
            playerInstance.x += delta;
        }
    },
    reset: function () {
        this.directionX = 1;
        this.x = this.defaultPosX;
        this.e.style.left = this.x + "px";
    },
    changeColor: function () {
        this.e.style.backgroundColor = colors.getRandomColor();
        ballInstance.e.style.backgroundColor = colors.getRandomColor();
    }
};
//y is contant
let botInstance = {
    controlledByHuman: false,
    w: 126,
    h: 26,
    defaultPosX: playingField.w / 2 - 126 / 2,
    x: playingField.w / 2 - 126 / 2,
    y: 50,
    direction: 1,
    halted: false,
    e: document.getElementById("bot"),
    moveByPlayer: function (dir) {
        this.directionX = dir;
        let delta = (10 * dir);
        let newPos = botInstance.x + delta;
        if (!detectCollisionPanelField(newPos)) {
            botInstance.e.style.left = newPos + "px";
            botInstance.x += delta;
        }
    },
    move: function () { //bot logic
        this.halted = false;
        let ballPositionY = ballInstance.y;
        let ballPositionX = ballInstance.x;
        let botCenter = this.x + this.w / 2;
        if (ballPositionX < botCenter) {
            this.direction = -1;
        } else if (ballPositionX > botCenter + 10) {
            this.direction = 1;
        } else {
            this.halted = true;
        }
        let delta = 10 * this.direction;
        let newPos = this.x + delta;
        let collisionRes = detectCollisionPanelFieldBot(newPos);
        if (collisionRes !== botCollisionWithBorder.noCollision) {
            this.halted = true;
        }
        if (!this.halted) {
            botInstance.x += delta;
        }
    },
    reset: function () {
        this.direction = 1;
        this.x = this.defaultPosX;
        this.e.style.left = this.x + "px";
    },
    changeColor: function () {
        this.e.style.backgroundColor = colors.getRandomColor();
        ballInstance.e.style.backgroundColor = colors.getRandomColor();
    }
};

function resetPlayingField() {
    ballInstance.reset();
    playerInstance.reset();
    botInstance.reset();
}

function updateScoresUI() {
    scores.update();
    resetPlayingField();
}

function getRandomDir() {
    let arr = [-1, 1];
    return arr[Math.ceil(Math.random() * arr.length - 1)];
}

function getRandomNum(min = 0, max) {
    return Math.ceil(Math.random() *
        (min === 0 ? max : (max - min) + min));
}

//directionY: 1 = down, -1 = up
//directionX: 1 = right, -1 = left
let ballInstance = {
    angle: 60,
    w: 24,
    h: 24,
    x: 10,
    y: 100,
    initSpeed: 5,
    speed: 5,
    directionY: 1,
    directionX: 1,
    e: document.getElementById("ball"),
    move: function () {
        //let el = document.getElementById("debug");
        let delta = Math.sin(this.angle * Math.PI / 180);
        this.y += delta * this.speed * this.directionY;
        this.x += (Math.acos(delta) * this.directionX) * this.speed;
        /*el.innerHTML = "delta: "+delta+", angle: "+this.angle+", speed: "+this.speed +
        "y: "+this.y+"x: "+this.x+", direction:X:"+this.directionX;*/
    },
    reset: function () {
        this.angle = getRandomNum(30, 80);
        this.directionX = getRandomDir();
        this.directionY = 1;
        this.x = getRandomNum(0, playingField.w);
        this.y = 100;
        this.speed = this.initSpeed;
        this.e.style.left = this.x + "px";
        this.e.style.top = this.y + "px";
    },
    changeColor: function () {
        this.e.style.backgroundColor = colors.getRandomColor();
    }
};

function movePlayer() {
    if (!gameState.paused) {
        if (pressedKeys.LEFT_PRESSED === true) {
            playerInstance.move(directionVars.DIR_X_LEFT);
        }
        if (pressedKeys.RIGHT_PRESSED === true) {
            playerInstance.move(directionVars.DIR_X_RIGHT);
        }
        if (gameState.gameMode === gameModes.MULTI_PLAYER) {

            if (pressedKeys.WASD_A_PRESSED) {
                botInstance.moveByPlayer(directionVars.DIR_X_LEFT);
            }
            if (pressedKeys.WASD_D_PRESSED) {
                botInstance.moveByPlayer(directionVars.DIR_X_RIGHT);
            }
        }
        playerInstance.e.style.left = playerInstance.x + "px";
        if (gameState.gameMode === gameModes.MULTI_PLAYER) {
            botInstance.e.style.left = botInstance.x + "px";
        }
    }

    let t = setTimeout(function () {
        movePlayer()
    }, 50);
}

function initGameLoop() {
    document.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
            case controlKey.LEFT: {
                pressedKeys.LEFT_PRESSED = true;
                break;
            }
            case controlKey.RIGHT: {
                pressedKeys.RIGHT_PRESSED = true;
                break;
            }
            case controlKey.WASD_A: {
                pressedKeys.WASD_A_PRESSED = true;
                break;
            }
            case controlKey.WASD_D: {
                pressedKeys.WASD_D_PRESSED = true;
                break;
            }
            case controlKey.ESC: {
                gameState.toggleFreezeGame();
                break;
            }
        }
    }, false);
    document.addEventListener("keyup", function (e) {
        switch (e.keyCode) {
            case controlKey.LEFT: {
                pressedKeys.LEFT_PRESSED = false;
                break;
            }
            case controlKey.RIGHT: {
                pressedKeys.RIGHT_PRESSED = false;
                break;
            }
            case controlKey.WASD_A: {
                pressedKeys.WASD_A_PRESSED = false;
                break;
            }
            case controlKey.WASD_D: {
                pressedKeys.WASD_D_PRESSED = false;
                break;
            }
        }
    }, false);
    playingField.viewPortWidth = document.documentElement.clientWidth;
    playingField.viewPortHeight = document.documentElement.clientHeight;
    gameState.setUpPosition();
    mainMenu.showWindow();
    ballInstance.e.style.top = 100 + "px";
    ballInstance.e.style.left = 10 + "px";
}

function commenceGame(gameMode) {
    gameState.gameMode = gameMode;
    mainMenu.hideWindow();
    gameState.hideOverlay();
    //start single player game and initialize bot
    if (!gameMode) {
        moveBot(1);
        moveBall();
        movePlayer();
    }
    //start local multiplayer game
    else {

        moveBall();
        movePlayer();

    }
}

function reverseBallDir() {
    if (ballInstance.directionY === 1) { //player
        if (ballInstance.directionX === 1) {
            ballInstance.directionY = directionVars.DIR_Y_UP;
            ballInstance.directionX = directionVars.DIR_X_LEFT;
        } else {
            ballInstance.directionY = directionVars.DIR_Y_UP;
            ballInstance.directionX = directionVars.DIR_X_RIGHT;
        }
    } else { //bot
        if (ballInstance.directionX === 1) {
            ballInstance.directionY = directionVars.DIR_Y_DWN;
            ballInstance.directionX = directionVars.DIR_X_LEFT;
        } else {
            ballInstance.directionY = 1;
            ballInstance.directionX = 1;
        }
    }
}

function detectCollision() {
    //get bottom coord
    let currBottomY = ballInstance.y;
    let currX = ballInstance.x;
    if (currBottomY >= 420) {
        scores.bot += 1;
        soundEffects.playSound(soundEffects.soundTypes.ROUND_LOST);
        updateScoresUI();
    } else if (currBottomY <= 0) {
        scores.player += 1;
        soundEffects.playSound(soundEffects.soundTypes.ROUND_WON);
        updateScoresUI();
    } else if ((currBottomY >= 350) &&
        (ballInstance.x > playerInstance.x
            &&
            ballInstance.x < playerInstance.x + playerInstance.w)) {
        if (playerInstance.directionX !== 0) {
            if (playerInstance.directionX !== ballInstance.directionX) {
                ballInstance.speed += 1;
                reverseBallDir();
            } else {
                ballInstance.speed += .25;
            }
        }
        return collision.withPlayer;
    } else if ((currBottomY <= botInstance.y) &&
        (ballInstance.x > botInstance.x
            &&
            ballInstance.x < botInstance.x + botInstance.w)) {
        return collision.withBot;
    } else if (currX + ballInstance.w >= playingField.w) {
        return collision.withEastWall;
    } else if (currX <= playingField.leftX) {
        return collision.withWestWall;
    }
}

function moveBall() {
    if (!gameState.paused) {
        ballInstance.move();
        ballInstance.e.style.top = ballInstance.y + "px";
        ballInstance.e.style.left = ballInstance.x + "px";
        if (detectCollision() === collision.withPlayer) {
            playerInstance.changeColor();
            soundEffects.playSound(soundEffects.soundTypes.BALL_HIT_RACKET);
            ballInstance.directionY = -1;
        } else if (detectCollision() === collision.withBot) {
            botInstance.changeColor();
            soundEffects.playSound(soundEffects.soundTypes.BALL_HIT_RACKET);
            ballInstance.directionY = 1;
        } else if (detectCollision() === collision.withWestWall) {
            if (ballInstance.directionY === -1 && ballInstance.directionX === -1) {
                ballInstance.directionY = -1;
                ballInstance.directionX = 1;
            } else if (ballInstance.directionY === 1 && ballInstance.directionX === -1) {
                ballInstance.directionX = 1;
            }
        } else if (detectCollision() === collision.withEastWall) {
            if (ballInstance.directionY === -1 && ballInstance.directionX === 1) {
                ballInstance.directionY = -1;
                ballInstance.directionX = -1;
            } else if (ballInstance.directionY === 1 && ballInstance.directionX === 1) {
                ballInstance.directionX = -1;
            }
        }
    }
    let t = setTimeout(function () {
        moveBall()
    }, 25);
}

function detectCollisionPanelField(newPos) {
    return newPos <= 0 || (newPos + botInstance.w + 24 >= playingField.w);
}

function detectCollisionPanelFieldBot(newPos) {
    if (newPos <= 0) {
        return botCollisionWithBorder.borderLeft;
    } else if (newPos + botInstance.w + 24 >= playingField.w) {
        return botCollisionWithBorder.borderRight;
    } else {
        return botCollisionWithBorder.noCollision;
    }
}

function moveBot(dir) {
    if (!gameState.paused) {
        botInstance.move();
        botInstance.e.style.left = botInstance.x + "px";
    }
    let t = setTimeout(function () {
        moveBot(dir)
    }, 50);
}

function toggleSound() {
    gameState.toggleSound();
}
