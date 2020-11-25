class PingPong extends HTMLElement {
  canvas;
  ctx;
  framePerSecond = 60;
  bola;
  // User Paddle
  usuario;
  // COM Paddle
  paleta;
  // NET
  maquina;
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = 600;
    this.canvas.height = 400;
    shadow.appendChild(this.canvas);
    this.bola = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      radius: 10,
      velocityX: 5,
      velocityY: 5,
      speed: 7,
      color: "WHITE",
    };
    this.usuario = {
      x: 0, // left side of canvas
      y: (this.canvas.height - 100) / 2, // -100 the height of paddle
      width: 10,
      height: 100,
      score: 0,
      color: "WHITE",
    };
    this.paleta = {
      x: this.canvas.width - 10, // - width of paddle
      y: (this.canvas.height - 100) / 2, // -100 the height of paddle
      width: 10,
      height: 100,
      score: 0,
      color: "WHITE",
    };
    this.maquina = {
      x: (this.canvas.width - 2) / 2,
      y: 0,
      height: 10,
      width: 2,
      color: "WHITE",
    };
    this.canvas.addEventListener("mousemove", (event) => {
      this.getMousePos(event);
    });
    let loop = setInterval(() => {
      this.dibujar();
    }, 1000 / this.framePerSecond);
  }
  getMousePos(evt) {
    let rect = this.canvas.getBoundingClientRect();

    this.usuario.y = evt.clientY - rect.top - this.usuario.height / 2;
  }
  // dibujar a rectangle, will be used to dibujar paddles
  dibujarRectangulo(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  // dibujar circle, will be used to dibujar the bola
  dibujarBola(x, y, r, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fill();
  }
  resetBola() {
    this.bola.x = this.canvas.width / 2;
    this.bola.y = this.canvas.height / 2;
    this.bola.velocityX = -this.bola.velocityX;
    this.bola.speed = 7;
  }

  // dibujar the maquina

  // dibujar text
  dibujarTexto(text, x, y) {
    this.ctx.fillStyle = "#FFF";
    this.ctx.font = "75px fantasy";
    this.ctx.fillText(text, x, y);
  }
  collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return (
      p.left < b.right &&
      p.top < b.bottom &&
      p.right > b.left &&
      p.bottom > b.top
    );
  }
  update() {
    // change the score of players, if the bola goes to the left "bola.x<0" computer win, else if "bola.x > canvas.width" the usuario win
    if (this.bola.x - this.bola.radius < 0) {
      this.paleta.score++;
      this.resetBola();
    } else if (this.bola.x + this.bola.radius > this.canvas.width) {
      this.usuario.score++;
      this.resetBola();
    }

    // the bola has a velocity
    this.bola.x += this.bola.velocityX;
    this.bola.y += this.bola.velocityY;

    // computer plays for itself, and we must be able to beat it
    // simple AI
    this.paleta.y +=
      (this.bola.y - (this.paleta.y + this.paleta.height / 2)) * 0.1;

    // when the bola collides with bottom and top walls we inverse the y velocity.
    if (
      this.bola.y - this.bola.radius < 0 ||
      this.bola.y + this.bola.radius > this.canvas.height
    ) {
      this.bola.velocityY = -this.bola.velocityY;
    }

    // we check if the paddle hit the usuario or the paleta paddle
    let player =
      this.bola.x + this.bola.radius < this.canvas.width / 2
        ? this.usuario
        : this.paleta;

    // if the bola hits a paddle
    if (this.collision(this.bola, player)) {
      // play sound
      // we check where the bola hits the paddle
      let collidePoint = this.bola.y - (player.y + player.height / 2);
      // normalize the value of collidePoint, we need to get numbers between -1 and 1.
      // -player.height/2 < collide Point < player.height/2
      collidePoint = collidePoint / (player.height / 2);

      // when the bola hits the top of a paddle we want the bola, to take a -45degees angle
      // when the bola hits the center of the paddle we want the bola to take a 0degrees angle
      // when the bola hits the bottom of the paddle we want the bola to take a 45degrees
      // Math.PI/4 = 45degrees
      let angleRad = (Math.PI / 4) * collidePoint;

      // change the X and Y velocity direction
      let direction =
        this.bola.x + this.bola.radius < this.canvas.width / 2 ? 1 : -1;
      this.bola.velocityX = direction * this.bola.speed * Math.cos(angleRad);
      this.bola.velocityY = this.bola.speed * Math.sin(angleRad);

      // speed up the bola everytime a paddle hits it.
      this.bola.speed += 0.1;
    }
  }

  // render function, the function that does al the dibujaring
  render() {
    // clear the canvas
    this.dibujarRectangulo(0, 0, this.canvas.width, this.canvas.height, "blue");

    // dibujar the usuario score to the left
    this.dibujarTexto(
      this.usuario.score,
      this.canvas.width / 4,
      this.canvas.height / 5
    );

    // dibujar the COM score to the right
    this.dibujarTexto(
      this.paleta.score,
      (3 * this.canvas.width) / 4,
      this.canvas.height / 5
    );

    // dibujar the maquina

    // dibujar the usuario's paddle
    this.dibujarRectangulo(
      this.usuario.x,
      this.usuario.y,
      this.usuario.width,
      this.usuario.height,
      this.usuario.color
    );

    // dibujar the COM's paddle
    this.dibujarRectangulo(
      this.paleta.x,
      this.paleta.y,
      this.paleta.width,
      this.paleta.height,
      this.paleta.color
    );

    // dibujar the bola
    this.dibujarBola(
      this.bola.x,
      this.bola.y,
      this.bola.radius,
      this.bola.color
    );
  }
  dibujar() {
    this.update();
    this.render();
  }
  // number of frames per second

  //call the juego function 50 times every 1 Sec
}
customElements.define("ping-pong", PingPong);
