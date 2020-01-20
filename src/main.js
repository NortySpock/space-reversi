"use strict";
const debugMode = false;
const frameDebug = false;
const targetFrameRate = 60;

const backgroundColor = 0;
const playerInvulnerableDebug = false;

let pointsString = '';
let pointsStringLocation;
var FPSstring  = '';
var FPSstringLocation;
const backgroundStarCount = 25;

let Global = {};
Global.canvasWidth = 700;
Global.canvasHeight = 700;
Global.backgroundStars = [];
Global.foregroundObjects = [];
Global.playerDead = false;
Global.backgroundColor;
Global.textColor;


function reset() {

    let canvas = createCanvas(Global.canvasWidth, Global.canvasHeight);
    canvas.parent('sketch-holder');
    canvas.drawingContext.imageSmoothingEnabled = false;

    frameRate(targetFrameRate);
    background(0);

    Global.backgroundColor = color(0);
    Global.textColor = color(255);

    Global.p1points = 0;
    Global.p2points = 0;

    Global.soundMgr = new SoundManager();
    Global.soundMgr.mute = !Global.enableSound;

    Global.textHandler = new TextHandler();

    Global.backgroundStars = [];
    preFillBackgroundStars();

    setInterval(halfSecondUpdateLoop,500);
}

function setup() {
  reset();
  Global.soundMgr.mute = false;
  //alert(document.getElementById("sketch-holder").style.border.color)
  //alert(window.getComputedStyle(document.querySelector('sketch-holder')).background)
}

function draw() {

    handleUserInput();

    //BACKGROUND
    background(Global.backgroundColor); //black color

    //do physics and render background items
    for(let i = 0; i < Global.backgroundStars.length;i++)
    {
      Global.backgroundStars[i].render();
    }



    renderBackgroundUI();
    //BACKGROUND

    //FOREGROUND




    renderForegroundUI();

    Global.textHandler.updateAndRender();

    //play all the sounds we've built up this frame
    Global.soundMgr.playAllQueuedSounds();


    if(frameDebug)
    {
      //freeze for analysis
      throw 'freeze';
    }
}


function mousePressed()
{
    resumeSoundIfContextBlocked();
}

//handles continuous presses
var handleUserInput = function()
{

};

function keyPressed() {
  if(keyCode == ENTER || keyCode == RETURN)
  {
    reset();
    return;
  }

  resumeSoundIfContextBlocked();

  if(key == 'M' )
  {
      Global.soundMgr.mute = !Global.soundMgr.mute
  }

  if(key == 'S')
  {
    Global.backgroundStars.push(new BackgroundStar(createVector(randomFromInterval(0,Global.canvasWidth),randomFromInterval(0,Global.canvasHeight))));
  }



};

function randomFromInterval(min,max){
    return Math.random()*(max-min+1)+min;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

//true-false coin-flip
function coinFlip()
{
  return (int(Math.random() * 2) == 0);
}

function updateUIstuff()
{
  var fps = frameRate();
  FPSstring = "FPS:" + fps.toFixed(0);

  pointsString = "Points: " + Global.points;
}

function renderBackgroundUI()
{
    textSize(14);
    textStyle(NORMAL);
    textFont('Courier New');
    stroke(Global.backgroundColor);
    fill(Global.textColor);
    //text(pointsString,pointsStringLocation.x,pointsStringLocation.y);
}

function renderForegroundUI()
{

}

function halfSecondUpdateLoop(){
  updateUIstuff();
}

function preFillBackgroundStars()
{
  while(Global.backgroundStars.length < backgroundStarCount)
  {
    Global.backgroundStars.push(new BackgroundStar());
  }
}

function onCanvas(x,y)
{
  if(x<0 || x > Global.canvasWidth)
  {
    return false;
  }
  if(y<0 || y > Global.canvasHeight)
  {
    return false;
  }
  return true;
}



function midpoint(x1,y1,x2,y2)
{
    return pointOnLine(x1,y1,x2,y2,0.5);
}

function pointOnLine(x1,y1,x2,y2,fraction)
{
    let newpoint = {x:(x1+x2)*fraction,y:(y1+y2)*fraction}
    return newpoint;
}


function resumeSoundIfContextBlocked()
{
  if (getAudioContext().state !== 'running')
  {
        getAudioContext().resume();
  }
}

function startGameMusic()
{

}

class TextHandler
{
  constructor()
  {
    this.msgList=[];
  }

  addMessage(msg,color,spot,ttl)
  {
    if(Global.enableStory == false)
    {
      return; //don't accept messages
    }

    switch(spot)
    {
      case 'top':
      case 'high':
        this.msgList.push({msg:msg, color:color, ttl:ttl, pos:createVector(Global.canvasWidth/2,Global.canvasHeight*(2/6))});
        break;

      case 'mid':
      case 'center':
        this.msgList.push({msg:msg, color:color, ttl:ttl, pos:createVector(Global.canvasWidth/2,Global.canvasHeight*(3/6))});
        break;

      case 'bottom':
      case 'low':
        this.msgList.push({msg:msg, color:color, ttl:ttl, pos:createVector(Global.canvasWidth/2,Global.canvasHeight*(4/6))});
        break;

      default:
          console.log('text spot not found:'+spot);
    }
  }

  updateAndRender()
  {
    textSize(22);
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    textFont('Palatino');

    if(this.msgList.length > 2)
    {
      console.log("warning, long message list:"+this.msgList.length);
    }
    for(let i = 0; i < this.msgList.length; i++)
    {
      let msg = this.msgList[i];
      if(msg.ttl > 0)
      {
        msg.ttl--;
        stroke(Global.backgroundColor);
        fill(msg.color);
        text(msg.msg,msg.pos.x,msg.pos.y);
      }
    }
    //delete end if it's too old
    if(this.msgList.length > 0 && (this.msgList[0] == null || this.msgList[0].ttl == 0))
    {
      this.msgList.shift();
    }
  }
}



class BackgroundStar
{
  //create a star at a random position
  constructor()
  {
    this.pos = createVector(randomFromInterval(0,Global.canvasWidth),randomFromInterval(0,Global.canvasHeight));

    //set size and fall rate
    this.minStarSize = 1;
    this.maxStarSize = 3;
    this.minFallSpeed = 1;
    this.maxFallSpeed = 3;

    this.size = randomFromInterval(this.minStarSize,this.maxStarSize);
    this.fallSpeed = randomFromInterval(this.minFallSpeed,this.maxFallSpeed);
    this.color = color(255);
  }

  //manually make the star fall, because it only falls down
  update()
  {
    this.pos.y += this.fallSpeed;

    //if it falls off the screen, move it back to the top
    if(this.pos.y > Global.canvasHeight + 10)
    {
      this.pos.y = -10; //recycle to top
      this.pos.x = randomFromInterval(0,Global.canvasWidth);
    }
  }

  //render with the size at the position
  render()
  {
    stroke(this.color);
    strokeWeight(this.size);
    point(this.pos.x,this.pos.y);
  }
}