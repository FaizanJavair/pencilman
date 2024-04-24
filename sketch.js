/*
I have implemented three extensions; platforms, sound and advanced graphics with particle system.
For the platforms, it was quite straight forward and I guess I got the hang of the factory pattern and overall I didn't found any difficulty.
However, the sound extension was a little tricky, because it was creating some problems for me to use a sound in a draw function which made the game
sound awful but using different functions fixed the bugs for me. But this extension was the most interesting one because now my game had that feel
which was obviously missing at first also I learned about .loop, .playMode, .play, .pause, and .stop to implement game sounds.
The third one, particle system, using the constructor pattern was one of the trickiest since it contains all the little bits of calculation 
to handle the emission of the particle. However I was unable to implement particle system at different points, so I just implemented at one. But
this is one of the things that I would go back to and learn more about it.
*/
 
//game character related variables
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

//game character control variables
var isLeft;
var isRight;
var isFalling;
var isPlummeting;

//scenery variables
var trees_x;
var clouds;
var mountains;
var canyon;
var collectable;

//game mechanics variables
var game_score;
var flagpole;
var lives;

//game sound variables
var jumpSound;
var coinCollect;
var gameWon;
var walkingSound;
var dyingSound;
var gameoverSound;
var backgroundGameSound;
var soundDead;

//Variable to check if platform is in contact or not
var isContact;

//Particle system variable
var emit;

function preload()
{
    soundFormats('mp3','wav');
    
    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    
    coinCollect = loadSound('assets/coin.wav');
    coinCollect.setVolume(0.1);
    
    gameWon = loadSound('assets/winningsound.wav');
    gameWon.setVolume(0.1);
    
    walkingSound = loadSound('assets/footstepgrass.wav');
    walkingSound.setVolume(0.1);
    
    dyingSound = loadSound('assets/Dead.wav');
    dyingSound.setVolume(0.1);
    
    gameoverSound = loadSound('assets/gameover.wav');
    gameoverSound.setVolume(0.1);
    
    backgroundGameSound = loadSound('assets/8-bit March.mp3');
    backgroundGameSound.setVolume(0.1);
}


function setup()
{
    backgroundGameSound.loop();
	createCanvas(1024, 576);
    floorPos_y = height * 3/4
    lives = 3;
    soundDead = lives;
    startGame();  
}

function draw()
{
    gameSound();
	// fill the sky blue
    background(100, 155, 255); 
	noStroke();
	// draw some green ground
    fill(0,155,0);
	rect(0, floorPos_y, width, height/4); 
    checkPlayerDie();
    push();
    translate(scrollPos,0);

    //Particle system 
    emit.updateParticles();

	// Draw clouds.
    drawClouds();

	// Draw mountains.
    drawMountains();
    
	// Draw trees.
    drawTrees();

    //Draw PencilSuperman
    drawSuperman();

    //draw pencil factory
    drawPencilFactory();
    
    //draw platforms
     for(var i = 0; i < platforms.length; i++)
     {
         platforms[i].draw();
     }
    
	// Draw canyons.
     for(var i = 0; i < canyon.length; i++)
        {
            drawCanyon(canyon[i]);
            checkCanyon(canyon[i]);
        }

	// Draw collectable items.
   for(var i = 0; i < collectable.length; i++)
        {
           if(collectable[i].isFound == false)
               {
                    drawCollectable(collectable[i]);
                    checkCollectable(collectable[i]);
               }
           
        }
    
    
    renderFlagpole();
    pop();
    
	// Draw game character.
	drawGameChar();
    
    fill(255, 255, 0);
    noStroke();
    textSize(20);
    text("Score:" + game_score, 20,20);
    fill(255,15,0);
    text("Lives:", 20, 40);
    
//  Game start and Game over Statements
    if(lives < 1)
        {
            fill(255, 255, 255, 200)
            rect(0, 0, width, height);
            fill(0, 0, 0);
            text("Game over. Press space to continue", width/2 - 150,height/2);
            return;
        }
    if(flagpole.isReached == true)
        {
            fill(255, 255, 255, 200)
            rect(0, 0, width, height);
            fill(0, 0, 0);
            text("Level complete. Press space to continue", width/2 - 150 ,height/2);
            return;
        }

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
    }
    

	// Logic to make the game character rise and fall.
    if(gameChar_y < floorPos_y)
        {
             isContact = false; 
                for(var i = 0; i < platforms.length; i++)
                {
                    if(platforms[i].checkContact(gameChar_world_x, gameChar_y) == true)
                        {
                            isContact = true;
                            isFalling = false;
                            break;
                        }
                }
            if(isContact == false)
            {
                gameChar_y += 5;
                isFalling = true; 
            }
        }
    else 
        {
            isFalling = false;
        }
    if(isPlummeting)
        {
            gameChar_y += 0.5;
            dyingSound.play();
           
        }
    
    if(flagpole.isReached == false)
        {
            checkFlagpole();
        }

    
	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed(){

     //Left arrow
    if(keyCode == 37)
        {
            console.log("left arrow");
            isLeft = true;
             walkingSound.play();
        }
    //Right Arrow
     if(keyCode == 39)
        {
            console.log("right arrow");
            isRight = true;
             walkingSound.play();
        }
    //Jumpman(spacebar)
    if(keyCode == 32 && gameChar_y == floorPos_y)
        {
            console.log("Spacebar");
            gameChar_y -= 150; 
            jumpSound.play();
        }
    if(isContact == true && keyCode == 32)
        {
            console.log("Spacebar");
            gameChar_y -= 200; 
            jumpSound.play();
        }
    if(keyCode == 32 && lives == 0)
        {
            lives = 4;
            gameoverSound.stop();
            backgroundGameSound.loop();
        }

}

function keyReleased()
{
      //Left arrow
     if(keyCode == 37)
        {
            console.log("left arrow");
            isLeft = false;
        }
    //Right Arrow
     if(keyCode == 39)
        {
            console.log("right arrow");
            isRight = false;
        }
}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	// draw game character
    if(isLeft && isFalling)
	{
		// add your jumping-left code
        fill(255,228,196);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -10, gameChar_y -50,
        gameChar_x +10, gameChar_y -50);
        fill(0);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -5, gameChar_y -60,
        gameChar_x +5, gameChar_y -60)
        fill(0,206,209);
        rect(gameChar_x -10, gameChar_y -50,
        20,40)
        fill(112,128,144);
        rect(gameChar_x -12, gameChar_y -10,
        7,12);
        rect(gameChar_x +1, gameChar_y -10,
        7,12);
        rect(gameChar_x, gameChar_y -69,
        7,20);

	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
        fill(255,228,196);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -10, gameChar_y -50,
        gameChar_x +10, gameChar_y -50);
        fill(0);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -5, gameChar_y -60,
        gameChar_x +5, gameChar_y -60)
        fill(0,206,209);
        rect(gameChar_x -10, gameChar_y -50,
        20,40)
        fill(112,128,144);
        rect(gameChar_x -8, gameChar_y -10,
        7,12);
        rect(gameChar_x +5, gameChar_y -10,
        7,12);
        rect(gameChar_x -7, gameChar_y -69,
        7,20);
               

	}
	else if(isLeft)
	{
		// add your walking left code
        fill(255,228,196);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -10, gameChar_y -50,
        gameChar_x +10, gameChar_y -50);
        fill(0);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -5, gameChar_y -60,
        gameChar_x +5, gameChar_y -60)
        fill(0,206,209);
        rect(gameChar_x -10, gameChar_y -50,
        20,40)
        fill(112,128,144);
        rect(gameChar_x -12, gameChar_y -10,
        7,12);
        rect(gameChar_x +1, gameChar_y -10,
        7,12);
        rect(gameChar_x, gameChar_y -50,
        7,20);

	}
	else if(isRight)
	{
		// add your walking right code
        fill(255,228,196);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -10, gameChar_y -50,
        gameChar_x +10, gameChar_y -50);
        fill(0);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -5, gameChar_y -60,
        gameChar_x +5, gameChar_y -60)
        fill(0,206,209);
        rect(gameChar_x -10, gameChar_y -50,
        20,40)
        fill(112,128,144);
        rect(gameChar_x -8, gameChar_y -10,
        7,12);
        rect(gameChar_x +5, gameChar_y -10,
        7,12);
        rect(gameChar_x -7, gameChar_y -50,
        7,20);

	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
        fill(255,228,196);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -10, gameChar_y -50,
        gameChar_x +10, gameChar_y -50);
        fill(0);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -5, gameChar_y -60,
        gameChar_x +5, gameChar_y -60)
        fill(0,206,209);
        rect(gameChar_x -10, gameChar_y -50,
        20,40)
        fill(112,128,144);
        rect(gameChar_x -10, gameChar_y -10,
        7,12);
        rect(gameChar_x +3, gameChar_y -10,
        7,12);
        rect(gameChar_x -17, gameChar_y -69,
        7,20);
        rect(gameChar_x +10, gameChar_y -69,
        7,20);              
        

	}
	else
	{
		// add your standing front facing code
        fill(255,228,196);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -10, gameChar_y -50,
        gameChar_x +10, gameChar_y -50);
        fill(0);
        triangle(gameChar_x, gameChar_y -70,
        gameChar_x -5, gameChar_y -60,
        gameChar_x +5, gameChar_y -60)
        fill(0,206,209);
        rect(gameChar_x -10, gameChar_y -50,
        20,40)
        fill(112,128,144);
        rect(gameChar_x -10, gameChar_y -10,
        7,12);
        rect(gameChar_x +3, gameChar_y -10,
        7,12);
        rect(gameChar_x -17, gameChar_y -50,
        7,20);
        rect(gameChar_x +10, gameChar_y -50,
        7,20);

	}

}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds()
{
     for(var i = 0; i < clouds.length; i++)
        {
            noStroke();
            fill(255);
            ellipse(clouds[i].xPos - 50*clouds[i].scale,
                    clouds[i].yPos,
                    clouds[i].scale*100);
            ellipse(clouds[i].xPos,
                    clouds[i].yPos,
                    clouds[i].scale*75);
            ellipse(clouds[i].xPos - 100*clouds[i].scale,
                    clouds[i].yPos,
                    clouds[i].scale*75);

        }
   
}

// Function to draw mountains objects.
function drawMountains()
{
        for(var i = 0; i < mountains.length; i++)
        {
           noStroke();
            fill(175);
            triangle(mountains[i].xPos,
                     mountains[i].yPos,
                     mountains[i].xPos + 450,
                     mountains[i].yPos,
                     mountains[i].xPos + 350,
                     mountains[i].yPos - 182);
            fill(125);
            triangle(mountains[i].xPos - 100,
                     mountains[i].yPos,
                     mountains[i].xPos + 250,
                     mountains[i].yPos,
                     mountains[i].xPos + 75,
                     mountains[i].yPos -232);
            fill(175);
            triangle(mountains[i].xPos + 75,
                     mountains[i].yPos - 232,
                     mountains[i].xPos + 250,
                     mountains[i].yPos,
                     mountains[i].xPos + 50,
                     mountains[i].yPos);
            fill(125);
            triangle(mountains[i].xPos + 250,
                     mountains[i].yPos,
                     mountains[i].xPos + 350,
                     mountains[i].yPos -182,
                     mountains[i].xPos + 450,
                     mountains[i].yPos);
        }

}
// Function to draw trees objects.
function drawTrees()
{
    for(var i = 0; i < trees_x.length; i++)
        {
            //Tree
            treePos_y = floorPos_y
            noStroke();
               fill(150,75,0);
               rect(trees_x[i],
                    floorPos_y - 70, 
                    20, 70);    
            //branches
                fill(0,155,0);
                ellipse(trees_x[i] +10,
                        floorPos_y -100,
                        75);
                fill(0,0,0,20);
                ellipse(trees_x[i] +10,
                        floorPos_y - 90,
                        45)
         }

}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
    
    fill(160,82,45);
    rect(t_canyon.x_pos, 432,
    t_canyon.width,200); 
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{

    if(gameChar_world_x> t_canyon.x_pos && gameChar_world_x< t_canyon.x_pos + t_canyon.width && gameChar_y>= floorPos_y)
        {
            isPlummeting = true;
        }
    if(isPlummeting == true )
        {
            gameChar_y += 5;
        }
}

// ---------------------------------
// Flagpole render and check functions
// ---------------------------------

function renderFlagpole()
{
    push();
    strokeWeight(5);
    stroke(102, 255, 230);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
    noStroke();
    fill(255, 128, 0);
    if(flagpole.isReached)
        {
            rect(flagpole.x_pos,floorPos_y - 250,50,50);    
        }
    else
        {
            rect(flagpole.x_pos,floorPos_y - 50,50,50);
        }
    pop();
}

function checkFlagpole()
{
    var d = abs(gameChar_world_x - flagpole.x_pos);
    
    if(d < 15)
        {
            backgroundGameSound.stop();
            flagpole.isReached = true;
            gameWon.play();
        }
}
// ---------------------------------
// Game Character check function
// ---------------------------------
function checkPlayerDie()
{
    
    if(gameChar_y > 576 && lives > 0)
        {
            lives -= 1;
            if(lives >= 1)
                {
                    startGame();
                }
        }
    for(var i=lives; i >= 0; i--)
        {
          
            if(i == 3)
                {
                    fill(255,0,0);
                    rect(80,30,10,10);
                    rect(100,30,10,10);
                    rect(120,30,10,10);
                    
                }
            if(i == 2)
                {
                    fill(255,0,0);
                    rect(80,30,10,10);
                    rect(100,30,10,10);
                }
            if(i == 1)
                {
                    fill(255,0,0);
                    rect(80,30,10,10);
                }
        }
    
}
// ---------------------------------
// startGame function
// ---------------------------------
function startGame()
{
    gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
    trees_x = [-600, -300 , 500, 700, 1300, 1700];
    clouds = [ {xPos: -100, yPos: 100, scale:1.0},
               {xPos: -200, yPos: 150, scale:1.0},
               {xPos: -500, yPos: 120, scale:1.0},
               {xPos: 250, yPos: 100, scale:1.0},
               {xPos: 500, yPos: 200, scale:1.0},
               {xPos: 800, yPos: 110, scale:1.0},
               {xPos: 1200, yPos: 108, scale:1.0},
               {xPos: 1500, yPos: 130, scale:1.0},
               {xPos: 1700, yPos: 140, scale:1.0},
                {xPos: 1900, yPos:100, scale:1.0}];
    mountains = [{xPos: -500 , yPos: 432},
                {xPos: 400 , yPos: 432},
                {xPos: 1500 , yPos: 432}];
    canyon = [
            //Left canyon
            {x_pos: -510, width: 200},
            //Middle canyon
             {x_pos: 300, width: 130},
            //Right canyon
             {x_pos: 1400, width: 130}];
    collectable = [
                //Left Collectables
                {x_pos: -730, y_pos: floorPos_y, size: 50, isFound: false},
                {x_pos: -540, y_pos: floorPos_y, size: 50, isFound: false},
                {x_pos: -680, y_pos: floorPos_y - 100, size: 50, isFound: false},
                {x_pos: -390, y_pos: floorPos_y - 200, size: 50, isFound: false},
                {x_pos: -280, y_pos: floorPos_y - 100, size: 50, isFound: false},
                {x_pos: -200, y_pos: floorPos_y - 100, size: 50, isFound: false},
                //Middle Collectables
                {x_pos: 150, y_pos: floorPos_y, size: 50, isFound: false},
                {x_pos: 190, y_pos: floorPos_y - 100, size: 50, isFound: false},
                {x_pos: 250, y_pos: floorPos_y - 230, size: 50, isFound: false},
                {x_pos: 600, y_pos: floorPos_y - 200, size: 50, isFound: false},
                {x_pos: 650, y_pos: floorPos_y - 200, size: 50, isFound: false},
                //Right Collectables
                {x_pos: 1060, y_pos: floorPos_y - 240, size: 50, isFound: false},
                {x_pos: 1250, y_pos: floorPos_y - 100, size: 50, isFound: false},
                {x_pos: 1300, y_pos: floorPos_y, size: 50, isFound: false},
                {x_pos: 1500, y_pos: floorPos_y - 200, size: 50, isFound: false},
                {x_pos: 1420, y_pos: floorPos_y- 200, size: 50, isFound: false},
                {x_pos: 1750, y_pos: floorPos_y- 150, size: 50, isFound: false},
                {x_pos: 1800, y_pos: floorPos_y, size: 50, isFound: false},
                {x_pos: 900, y_pos: floorPos_y, size: 50, isFound: false}
                ];
    platforms = [];
    //platforms in the start
    platforms.push(createPlatforms(100, floorPos_y - 100, 150));
    platforms.push(createPlatforms(200,floorPos_y - 230, 150));
    platforms.push(createPlatforms(560, floorPos_y - 200, 150));
    //platforms on the left side
    platforms.push(createPlatforms(-300, floorPos_y - 100, 150));
    platforms.push(createPlatforms(-400, floorPos_y - 200, 150));
    platforms.push(createPlatforms(-700, floorPos_y - 100, 150));
    //platforms on the right side
    platforms.push(createPlatforms(1000, floorPos_y - 240, 150));
    platforms.push(createPlatforms(1200, floorPos_y - 100, 150));
    platforms.push(createPlatforms(1700, floorPos_y - 150, 150));
    platforms.push(createPlatforms(1400, floorPos_y - 200, 150));
    game_score = 0;
    
    flagpole = {x_pos: 2000, isReached: false};
    emit = new Emitter(1120, floorPos_y - 190, 0, -1, 20, color(200, 200, 200, 100));
    emit.startEmitter(200, 400);
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
     noStroke();
            fill(255,255,36);

            ellipse(t_collectable.x_pos , t_collectable.y_pos - 20, t_collectable.size -25, t_collectable.size);
            fill(255,215,0);
            ellipse(t_collectable.x_pos , t_collectable.y_pos - 20,t_collectable.size -30, t_collectable.size -10); 
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
     if(dist(t_collectable.x_pos, t_collectable.y_pos, gameChar_world_x, gameChar_y) < t_collectable.size)
        {
           t_collectable.isFound = true;
            game_score += 1;
            coinCollect.play();
        }
   
}

function gameSound()
{
    if(lives == 1 && isPlummeting == true)
        {
            
            backgroundGameSound.stop();
            gameoverSound.play();  
                
        }
   
}

//Creating platforms Factory pattern
function createPlatforms(x, y, length)
{
    var p = 
    {
        x:x,
        y:y,
        length:length,
        draw: function()
        {   fill(204, 102, 0);
            rect(this.x, this.y, this.length, 20);
            fill(0, 230, 0);
            rect(this.x, this.y, this.length, 5);

        },
        checkContact: function(gc_x, gc_y)
        {
            if(gc_x > this.x && gc_x < this.x + this.length)
            {
                var d = this.y - gc_y;
                if(d >= 0 && d < 5)
                {
                    return true;
                }

            }

            return false;
        }
    }
    return p;
}

//Function drawing superman
function drawSuperman()
{
    //cape
    fill(200, 0, 0);
    triangle(0, floorPos_y - 200, 100, floorPos_y, -20, floorPos_y);
    triangle(100, floorPos_y - 200, 0, floorPos_y, 120, floorPos_y);
    //head
    fill(255,228,196);
    triangle(0, floorPos_y - 200,
    100, floorPos_y - 200, 50, floorPos_y - 300);
    fill(0);
    triangle(25, floorPos_y - 250, 75, floorPos_y - 250, 50, floorPos_y - 300);
    //body
    fill(40, 131, 186);
    rect(0, floorPos_y - 200, 100, 150);
    //middle sign
    fill(200,0,0);
    triangle(20, floorPos_y - 180, 80, floorPos_y - 180, 50, floorPos_y - 140);
    fill(255, 235, 0);
    triangle(22, floorPos_y - 179, 78, floorPos_y - 179, 50, floorPos_y - 142);
    fill(200, 0, 0);
    textSize(32);
    text('P', 44, floorPos_y - 155);
    //legs
    fill(112,128,144);
    rect(0, floorPos_y - 50, 30, 50);
    rect(70, floorPos_y - 70, 30, 50);
    //arms
    rect(100, floorPos_y - 260, 30,60);
    rect(-30, floorPos_y - 200, 30, 60);
}
//Drawing a Pencil Factory
function drawPencilFactory()
{
    
    fill(184, 76, 0);
    rect(1110, floorPos_y - 180, 20, 120);
    fill(125);
    rect(880, floorPos_y - 100, 250, 100);
    fill(0);
    rect(880, floorPos_y - 120, 120, 20);
    fill(255);
    textSize(15);
    text('Pencil Factory', 880, floorPos_y - 105);
    stroke(0);
    strokeWeight(2);
    line(880, floorPos_y - 100, 1130, floorPos_y);
    line(1130, floorPos_y - 100, 880, floorPos_y);
    noStroke();
}

//Particle System for the pencil factory

function Particle(x, y, xSpeed, ySpeed, size, colour)
{
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
    this.colour = colour;
    this.age = 0;
    
    this.drawParticle = function()
    {
        fill(this.colour);
        ellipse(this.x, this.y, this.size);
    }
    
    this.updateParticle = function()
    {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.age ++;
    }
}

function Emitter(x, y, xSpeed, ySpeed, size, colour)
{
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
    this.colour = colour;
    
    this.startParticles = 0;
    this.lifetime = 0;
    
    this.particles = [];
    this.addParticle = function()
    {
         var p = new Particle(random(this.x-10,this.x +10), 
                         random(this. y-10,this.y + 10), 
                         random(this.xSpeed - 1, this.xSpeed + 1), random(this.ySpeed - 1, this.ySpeed +1), random(this.size -4, this.ySpeed +4), this.colour);
                
                return p;
    }
    
    this.startEmitter = function(startParticles, lifetime)
    {
        this.startParticles = startParticles;
        this.lifetime = lifetime;
        
        //start emitter with initial particles
        
        for(var i = 0; i < startParticles; i++)
            {
        
                
                this.particles.push(this.addParticle());
            }
    }
    
    this.updateParticles = function()
    {
        var deadParticles = 0;
        //iterate through particles and draw to screen
        for (var i = this.particles.length - 1; i >= 0; i--)
            {
                this.particles[i].drawParticle();
                this.particles[i].updateParticle();
                
                if(this.particles[i].age > random(0, this.lifetime))
                    {
                        this.particles.splice(i, 1);
                        deadParticles ++;
                    }
            }
        if(deadParticles > 0)
            {
                for (var i = 0; i < deadParticles; i++)
                    {
                         this.particles.push(this.addParticle());
                    }
               
            }
        
    }
}


