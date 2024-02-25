import Matter from 'matter-js'
import './style.css'

const canvas = document.querySelector('#app')
const end = document.querySelector('#end')

class Game {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.previewBall = null
    this.lastBall = null
    this.currentBallSize = 0
    this.nextBallSize = 0
    this.loseHeight = 160
    this.state = 'ready'
  }
}

const game = new Game(640, 960)

const balls = [
  { radius: 26, img: './img/circle0.webp' },
  { radius: 39, img: './img/circle1.webp' },
  { radius: 54, img: './img/circle2.webp' },
  { radius: 56, img: './img/circle3.webp' },
  { radius: 76, img: './img/circle4.webp' },
  { radius: 92, img: './img/circle5.webp' },
  { radius: 96, img: './img/circle6.webp' },
  { radius: 129, img: './img/circle7.webp' },
  { radius: 154, img: './img/circle8.webp' },
  { radius: 154, img: './img/circle9.webp' },
  { radius: 204, img: './img/circle10.webp' },
]

const { Render, Engine, Bodies, Composite, Events, MouseConstraint, Mouse, Runner } = Matter

const engine = Engine.create()

const render = Render.create({
  element: canvas,
  engine: engine,
  options: {
    wireframes: false,
    width: game.width,
    height: game.height,
    background: '#FEE2B0'
  }
})

const ball = Bodies.circle(320, 32, 26, {
  isStatic: true,
  render: {
    sprite: {
      texture: './img/circle0.webp',
      xScale: 26 * 2 / 52,
      yScale: 26 * 2 / 52
    }
  }
})
game.previewBall = ball
Composite.add(engine.world, [ball])

const friction = {
  friction: 0.006,
  frictionStatic: 0.006,
  frictionAir: 0,
  restitution: 0.1
}

const wallProps = {
  isStatic: true,
  render: { fillStyle: '#FFC58F' },
  ...friction,
}

const gameStatics = [
  // Left
  Bodies.rectangle(-(64 / 2), 960 / 2, 64, 960, wallProps),

  // Right
  Bodies.rectangle(640 + (64 / 2), 960 / 2, 64, 960, wallProps),

  // Bottom
  Bodies.rectangle(game.width / 2, game.height + (64 / 2) - 48, game.width, 64, wallProps),
];
Composite.add(engine.world, gameStatics);

Render.run(render)

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false,
    },
  },
})



Events.on(mouseConstraint, 'mousemove', (event) => {

  const mouseX = event.mouse.position.x;

  // ball.position.x = mouseX

  game.previewBall.position.x = mouseX
})

Events.on(mouseConstraint, 'mouseup', (event) => {
  if (game.state !== 'ready') return
  game.state = 'dropping'
  const mouseX = event.mouse.position.x;

  Composite.remove(engine.world, game.previewBall)
  game.lastBall = generateBall(mouseX, 32, game.currentBallSize)

  Composite.add(engine.world, [game.lastBall])

  setRandomBall()
  game.currentBallSize = game.nextBallSize

  game.previewBall = generateBall(mouseX, 32, game.currentBallSize, { isStatic: true })

  setTimeout(() => {
    if (game.state === 'dropping') {
      Composite.add(engine.world, game.previewBall);
      game.state = 'ready'
    }
  }, 500);
})

Events.on(engine, 'collisionStart', function (e) {
  for (let i = 0; i < e.pairs.length; i++) {
    const { bodyA, bodyB } = e.pairs[i];

    if (bodyA.isStatic || bodyB.isStatic) continue

    const aY = bodyA.position.y + bodyA.circleRadius
    const bY = bodyB.position.y + bodyB.circleRadius

    if (aY < game.loseHeight || bY < game.loseHeight) {
      end.style.display = 'flex'
      return
    }


    if (bodyA.sizeIndex !== bodyB.sizeIndex) continue

    const newSize = bodyA.sizeIndex + 1

    const midPosX = (bodyA.position.x + bodyB.position.x) / 2
    const midPosY = (bodyA.position.y + bodyB.position.y) / 2

    Composite.remove(engine.world, [bodyA, bodyB]);
    Composite.add(engine.world, generateBall(midPosX, midPosY, newSize))
  }

})

render.mouse = mouse
const runner = Runner.create()

Runner.run(runner, engine)

function generateBall(x, y, radius, options) {
  const size = balls[radius]

  const ball = Bodies.circle(x, y, size.radius, {
    ...options,
    render: {
      sprite: {
        texture: size.img,
        xScale: (size.radius * 2) / (size.radius * 2),
        yScale: (size.radius * 2) / (size.radius * 2)
      }
    },
  })

  ball.sizeIndex = radius

  return ball
}

function setRandomBall() {
  const randomSize = Math.floor(Math.random() * 4)

  game.nextBallSize = randomSize
}


