var scores = {
	player: 0,
	bot: 0,
	playerUI: document.getElementById("playerScore"),
	botUI: document.getElementById("botScore"),
	update: function(){
		this.playerUI.innerHTML = this.player;
		this.botUI.innerHTML = this.bot;
	}
};

var controlKey ={
	LEFT: 37,
	RIGHT: 39
};

var playingField = {
	leftX:0,
	rightX: 0,
	topY: 0,
	w: 700,
	h: 500,
	e: document.getElementById("field")
};

var botCollisionWithBorder = {
	borderRight: 0,
	borderLeft: 1,
	noCollision: 2
};
var collision = {
	withBot: 0,
	withPlayer: 1,
	withWestWall: 2,
	withEastWall: 3,
	withNorthWall: 4,
	withSouthWall: 5
};

//moving mode: -1 - west, 0 - stationary, 1 - east
var playerInstance = {
	w: 126,
	h: 26,
	x: 10,
	y: 350,
	time: 0,
	distanceTraveled: 0,
	directionX: 0,
	e: document.getElementById("player"),
	move: function(dir){
		this.directionX = dir;
		var delta = (10 * dir);
		var newPos = playerInstance.x + delta;
		if(!detectCollisionPanelField(newPos)){
			playerInstance.e.style.left = newPos + "px";
			playerInstance.x+=delta;
			playerInstance.distanceTraveled+=delta;
			playerInstance.currSpeed = playerInstance.distanceTraveled/playerInstance.time;
		}
	},
	reset: function(){
		this.directionX = 1;
		this.x = 10;
		this.e.style.left = this.x + "px";
	}
};
//y is contant
var botInstance = {
	w: 126,
	h: 26,
	x: 10,
	y: 50,
	direction: 1,
	halted: false,
	e: document.getElementById("bot"),
	move: function(){
		this.halted = false;
		var ballPositionY = ballInstance.y;
		var ballPositionX = ballInstance.x;
		var botCenter = this.x + this.w/2;
		if(ballPositionX < botCenter){
			this.direction = -1;
		}
		else if(ballPositionX > botCenter+10){
			this.direction = 1;
		}
		else{
			this.halted = true;
		}
			var delta = 10 * this.direction;
			var newPos = this.x + delta;
			var collisionRes = detectCollisionPanelFieldBot(newPos);
			if(collisionRes != botCollisionWithBorder.noCollision){
				this.halted = true;
			}
			if(!this.halted) {
				botInstance.x+=delta;
			}	
	},
	reset: function(){
		this.direction = 1;
		this.x = 10;
		this.e.style.left = this.x + "px";
	}
};
function resetPlayingField(){
	ballInstance.reset();
	playerInstance.reset();
	botInstance.reset();
}
function updateScoresUI(){
	scores.update();
	resetPlayingField();
}
//directionY: 1 = down, -1 = up
//directionX: 1 = right, -1 = left
var ballInstance = {
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
	move: function(){
		var delta = Math.sin(this.angle*Math.PI/180);
		this.y += delta * this.speed * this.directionY;
		this.x += (Math.acos(delta) * this.directionX) * this.speed;
	},
	reset: function(){
		this.directionX = 1;
		this.x = 10;
		this.y = 100;
		this.speed = this.initSpeed;
		this.e.style.left = this.x + "px";
		this.e.style.top = this.y + "px";
	}
}
function initGameLoop(){
	document.addEventListener("keydown", movePlayerRacket, false);
	ballInstance.e.style.top = 100 + "px";
	ballInstance.e.style.left = 10 + "px";
	moveBot(1);
	moveBall();
}
function reverseBallDir(){
	if(ballInstance.directionY == 1){ //player
		if(ballInstance.directionX == 1){
			ballInstance.directionY = -1;
			ballInstance.directionX = -1;
		}
		else{
			ballInstance.directionY = -1;
			ballInstance.directionX = 1;
		}
	}
	else{ //bot
		if(ballInstance.directionX == 1){
			ballInstance.directionY = 1;
			ballInstance.directionX = -1;
		}
		else{
			ballInstance.directionY = 1;
			ballInstance.directionX = 1;
		}
	}
}
function detectCollision(){
	//get bottom coord
	var currBottomY = ballInstance.y;
	var currX = ballInstance.x;
	if(currBottomY >= 350 && 
		(ballInstance.x > playerInstance.x 
			&& 
		ballInstance.x < playerInstance.x + playerInstance.w)) {
		if(playerInstance.directionX != 0){
			
			if(playerInstance.directionX != ballInstance.directionX){
				ballInstance.speed+=1;
				reverseBallDir();
			}
			else{
				//hmmm
			}
		}
		
		return collision.withPlayer;
	}
	else if((currBottomY <= botInstance.y) &&
		(ballInstance.x > botInstance.x 
			&& 
		ballInstance.x < botInstance.x + botInstance.w)) {
			//alert("collision with bot")
		return collision.withBot;
	}
	else if(currX + ballInstance.w >= playingField.w) {
		//alert("east wall collision");
		return collision.withEastWall;
	}
	else if(currX <= playingField.leftX) {
		//alert("west wall collision");
		return collision.withWestWall;
	}
	else if(currBottomY >= playingField.h){
		scores.bot+=1;
		updateScoresUI();
	}
	else if(currBottomY <= 0){
		scores.player+=1;
		updateScoresUI();
	}
}
function moveBall(){
	ballInstance.move();
	ballInstance.e.style.top = ballInstance.y + "px";
	ballInstance.e.style.left = ballInstance.x + "px";
	if(detectCollision() == collision.withPlayer){
		ballInstance.directionY = -1;
	}
	else if(detectCollision() == collision.withBot){
		ballInstance.directionY = 1;
	}
	else if(detectCollision() == collision.withWestWall){
		if(ballInstance.directionY == -1 && ballInstance.directionX == -1){
			ballInstance.directionY = -1;
			ballInstance.directionX = 1;
		}
		else if (ballInstance.directionY == 1 && ballInstance.directionX == -1){
			ballInstance.directionX = 1;	
		}
	}
	else if(detectCollision() == collision.withEastWall){
		if(ballInstance.directionY == -1 && ballInstance.directionX == 1){
			ballInstance.directionY = -1;
			ballInstance.directionX = -1;
		}
		else if (ballInstance.directionY == 1 && ballInstance.directionX == 1){
			ballInstance.directionX = -1;	
		}
	}
	var t = setTimeout(function(){moveBall()},25);
}
function detectCollisionPanelField(newPos){
	if(newPos <= 0 || (newPos + botInstance.w + 24 >= playingField.w)){
		return true;
	}
	return false;
}
function detectCollisionPanelFieldBot(newPos){
	if(newPos <= 0){
		return botCollisionWithBorder.borderLeft;
	}
	else if(newPos + botInstance.w + 24 >= playingField.w){
		return botCollisionWithBorder.borderRight;
	}
	else{
		return botCollisionWithBorder.noCollision;
	}
}
function movePlayerRacket(e){
	var key = e.keyCode;
	if(key == 37 || key == 39){
		setInterval(function () {
		playerInstance.time+=1;
		}, 1000);
	if(key == controlKey.LEFT){
		playerInstance.move(-1);
	}
	else if(key == controlKey.RIGHT){
		playerInstance.move(1);
	}	
	}
}
function moveBot(dir){
	botInstance.move();
	botInstance.e.style.left = botInstance.x + "px";
	var t = setTimeout(function(){moveBot(dir)},50);
}
