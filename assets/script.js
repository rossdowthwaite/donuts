let currentBubble;
let startRadius;
let width = document.documentElement.clientWidth;
let height = document.documentElement.clientHeight;
let canvasElement = document.getElementById('canvas');
let centerX = width / 2 ;
let centerY = height / 2 ;

let colors = ['#a15fbd', '#2ecfc8', '#F73C53', '#F6E23B', '#F6AA3B', '#F16363', ];
let bgColor = '#5ca9e1';
let donuts = ['White_donut.png', 'Brown_donut.png', 'Pink_donut.png',];
let donutTexture = 0;

let ballMinWidth = 10;
let ballMaxWidth = 60;
let maxBallsLength = 36;
let ticker = 0;
let donutCount = 0;

// Boundary bodies
let boundaries;

// Matter Js stuff
var Engine = Matter.Engine,
Render = Matter.Render,
Runner = Matter.Runner,
Composites = Matter.Composites,
Common = Matter.Common,
MouseConstraint = Matter.MouseConstraint,
Mouse = Matter.Mouse,
World = Matter.World,
Bodies = Matter.Bodies;
Body = Matter.Body;
Events = Matter.Events;

globalRender = Render;

let engine;
let render;
let runner;
let matter;

window.onload  = function() {
  matter = init();
}

function init() {
  initMatter();
  initMouse();
  initRunner();
  createBoundaries();

  engine.world.gravity.y = 0.3;

  // fit the render viewport to the scene
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: document.documentElement.clientWidth, y: document.documentElement.clientHeight }
  });

  // context for MatterTools.Demo
  return {
    engine: engine,
    runner: runner,
    render: render,
    canvas: render.canvas,
    stop: function() {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    }
  };
}

function initMatter() {
  // create engine
  engine = Engine.create(),
  world = engine.world;

  // create renderer
  render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: Math.min(width),
      height: Math.min(height),
      showVelocity: false,
      showAngleIndicator: false,
      background: 'transparent',
      wireframes: false
    }
  });

  Render.run(render);
}

function initRunner() {
  // Create runner
  runner = Runner.create();
  Runner.run(runner, engine);

  Events.on(runner, "tick", draw);
}


function createBoundaries() {

  let width = window.innerWidth || document.body.clientWidth;
  let height = window.innerHeight || document.body.clientHeight;

  let centerX = width / 2 ;
  let centerY = height / 2 ;

  if( boundaries ) {
    Matter.Composite.remove(world, boundaries);
  }

  let bottomBoundary = Bodies.rectangle( centerX, height, width * 2, 2, { // bottom
      isStatic: true,
      render: {
        visible: false,
        fillStyle: '#FFF',
        strokeStyle: '#FFF',
      }
    });

  let rightBoundary = Bodies.rectangle(width + 50, centerY, 2, height, { // Right
      isStatic: true,
      render: {
        visible: false,
        fillStyle: '#FFF',
        strokeStyle: '#FFF',
      }
    });

  let leftBoundary = Bodies.rectangle(-50, centerY, 2, height, { // Left
      isStatic: true,
      render: {
        visible: false,
        fillStyle: '#FFF',
        strokeStyle: '#FFF',
      }
    });

  boundaries = Body.create({
    parts: [bottomBoundary, rightBoundary, leftBoundary],
    isStatic: true
  });

  World.add(world, boundaries);
}


/**
* Adds a circle to the world
**/
function addDonut(){

  // Set the properties randomly
  let r = 120;
  let x = randomStats().x;
  let c = randomStats().color;
  let y = 0 - ( r * 4 );
  let texture = donuts[donutTexture];

  donutTexture++;
  if(donutTexture === donuts.length){
    donutTexture = 0;
  }

  let spriteScale = ( r * 2 ) / 762;

  // Build the circle
  let donut = Bodies.circle(x, y, r, {
    isStatic: false,
    isSensor: false,
    restitution: 0.8,
    render: {
      fillStyle: c,
      strokeStyle: c,
      opacity: 1,
      sprite: {
          texture: 'assets/images/' + texture,
          xScale: spriteScale,
          yScale: spriteScale
      }
    }
  });

  // Add the the screen
  World.add( world, donut );
  currentBubble = donut;
}

function randomStats(){

  let stats = {
    x: Math.floor(Math.random() * width) + 1,
    y: Math.floor(Math.random() * height) + 1,
    r: Math.floor(Math.random() * (ballMaxWidth - ballMinWidth + 1) + ballMinWidth)
  };

  return stats
}

function draw() {
  ticker++;
  if ( ticker % 40 === 0 && donutCount <= maxBallsLength) {
    addDonut();
    donutCount++;
  }
}

function handleOrientation(event) {
  var x = event.gamma; // In degree in the range [-90,90]
  var y = event.beta; // In degree in the range [-180,180]

  engine.world.gravity.y = (y * -0.7) / 100;
  engine.world.gravity.x = (x * -0.7) / 100;

  if( engine.world.gravity.y === 0 ){
    engine.world.gravity.y = 0.6;
  };
}

window.addEventListener('deviceorientation', handleOrientation);

function initMouse() {
  var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
          mouse: mouse,
          constraint: {
              stiffness: 0.2,
              render: {
                  visible: false
              }
          }
      });

  World.add(world, mouseConstraint);
}

function resizeCanvas() {
  matter.canvas.width = window.innerWidth || document.body.clientWidth;
  matter.canvas.height = window.innerHeight || document.body.clientHeight;
  createBoundaries();
}
