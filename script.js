const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('ui-layer');
const uiTitle = document.getElementById('ui-title');
const uiSubtitle = document.getElementById('ui-subtitle');
const restartBtn = document.getElementById('restart-btn');

// Game state
let score = 0;
let lives = 3;
let isGameOver = false;
let isWin = false;
let animationId;

// Audio setup (using simple Web Audio API beeps)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(frequency, duration, type = 'square') {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // low volume
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

// Colors definition (Neon vibrant)
const COLORS = {
    paddle: '#0ff', // Cyan
    ball: '#fff', // White
    brickRows: ['#ff00ff', '#0f0', '#0ff', '#fff', '#ff00ff'] // Magenta, Green, Cyan, White
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 8,
    speed: 5,
    dx: 5 * (Math.random() > 0.5 ? 1 : -1),
    dy: -5
};

// Paddle object
const paddle = {
    width: 100,
    height: 12,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    speed: 8,
    dx: 0
};

// Bricks settings
const brickConfig = {
    rows: 5,
    columns: 9, // Fit well within 800 width
    width: 75,
    height: 20,
    padding: 10,
    offsetTop: 60,
    offsetLeft: 22.5 // Centering: (800 - (9*75 + 8*10)) / 2  = (800 - 675 - 80) / 2 = 22.5
};

let bricks = [];

function createBricks() {
    bricks = [];
    for (let c = 0; c < brickConfig.columns; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickConfig.rows; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}
createBricks();

// Controls
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
});

// Mouse & Touch Controls
function handleInteractionMove(e) {
    let clientX;
    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
    } else {
        clientX = e.clientX;
    }
    
    const rect = canvas.getBoundingClientRect();
    // Scale the interaction point back to logical canvas coordinates
    const scaleX = canvas.width / rect.width;
    const relativeX = (clientX - rect.left) * scaleX;
    
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
        
        // Boundaries
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
    }
}
canvas.addEventListener('mousemove', handleInteractionMove);
canvas.addEventListener('touchmove', (e) => {
    if(!isGameOver && !isWin) e.preventDefault(); // allow scrolling if game is over
    handleInteractionMove(e);
}, { passive: false });


// Drawing functions
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.ball;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.ball;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0; // Reset shadow for other objects
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = COLORS.paddle;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.paddle;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    for (let c = 0; c < brickConfig.columns; c++) {
        for (let r = 0; r < brickConfig.rows; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickConfig.width + brickConfig.padding) + brickConfig.offsetLeft;
                const brickY = r * (brickConfig.height + brickConfig.padding) + brickConfig.offsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickConfig.width, brickConfig.height);
                ctx.fillStyle = COLORS.brickRows[r % COLORS.brickRows.length];
                ctx.shadowBlur = 8;
                ctx.shadowColor = ctx.fillStyle;
                ctx.fill();
                ctx.closePath();
                ctx.shadowBlur = 0;
            }
        }
    }
}

function drawScore() {
    ctx.font = '16px "Press Start 2P"';
    ctx.fillStyle = '#fff';
    ctx.fillText(`SCORE: ${score}`, 20, 35);
}

function drawLives() {
    ctx.font = '16px "Press Start 2P"';
    ctx.fillStyle = '#ff0000'; // red for lives
    ctx.fillText(`LIVES: ${lives}`, canvas.width - 150, 35);
}

// Update game objects
function update() {
    if (isGameOver || isWin) return;

    // Move Paddle via keyboard
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }

    // Move Ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall Collision (right/left)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
        playBeep(200, 0.05); // bounce sound
    }

    // Wall Collision (top)
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
        playBeep(200, 0.05);
    }
    
    // Bottom collision (Lose life)
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        playBeep(100, 0.3, 'sawtooth'); // Error sound
        if (!lives) {
            isGameOver = true;
            showGameOver();
        } else {
            resetBall();
        }
    }

    // Paddle Collision
    if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height
    ) {
        // Calculate hit point for bounce angle
        let hitPoint = ball.x - (paddle.x + paddle.width / 2);
        // Normalize between -1 and 1
        hitPoint = hitPoint / (paddle.width / 2);
        
        let maxAngle = Math.PI / 3; // 60 degrees max
        let angle = hitPoint * maxAngle;
        
        // Retain current speed mathematically
        let currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        
        ball.dx = currentSpeed * Math.sin(angle);
        ball.dy = -currentSpeed * Math.cos(angle);
        
        playBeep(300, 0.1);
        
        // Prevent sticking inside paddle
        ball.y = paddle.y - ball.radius - 1; 
    }

    // Brick Collision
    let won = true;
    for (let c = 0; c < brickConfig.columns; c++) {
        for (let r = 0; r < brickConfig.rows; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                won = false;
                if (
                    ball.x + ball.radius > b.x &&
                    ball.x - ball.radius < b.x + brickConfig.width &&
                    ball.y + ball.radius > b.y &&
                    ball.y - ball.radius < b.y + brickConfig.height
                ) {
                    ball.dy *= -1;
                    b.status = 0;
                    score += 10;
                    playBeep(600 + r * 50, 0.08); // Higher pitch for each row
                    
                    // Slightly increase speed
                    ball.dx *= 1.01;
                    ball.dy *= 1.01;
                }
            }
        }
    }

    if (won && !isGameOver) {
        isWin = true;
        showWin();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -5;
    paddle.x = canvas.width / 2 - paddle.width / 2;
}

function draw() {
    // Clear canvas entirely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();
    drawLives();

    update();

    if (!isGameOver && !isWin) {
        animationId = requestAnimationFrame(draw);
    }
}

// Game State Management
function showGameOver() {
    uiLayer.classList.remove('hidden');
    uiTitle.textContent = "GAME OVER";
    uiTitle.style.color = "#f00";
    uiTitle.style.textShadow = "0 0 10px #f00, 0 0 20px #f00";
    uiSubtitle.textContent = `FINAL SCORE: ${score}`;
}

function showWin() {
    uiLayer.classList.remove('hidden');
    uiTitle.textContent = "YOU WIN!";
    uiTitle.style.color = "#0f0";
    uiTitle.style.textShadow = "0 0 10px #0f0, 0 0 20px #0f0";
    uiSubtitle.textContent = `FINAL SCORE: ${score}`;
    playBeep(800, 0.5);
    setTimeout(() => playBeep(1000, 0.5), 200);
}

function initGame() {
    score = 0;
    lives = 3;
    isGameOver = false;
    isWin = false;
    createBricks();
    resetBall();
    uiLayer.classList.add('hidden');
    
    // Attempt audio context resume in case it was suspended (autoplay policy)
    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    cancelAnimationFrame(animationId);
    draw();
}

restartBtn.addEventListener('click', initGame);

// Start game initially
draw();
