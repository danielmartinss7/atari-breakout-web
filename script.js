const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('ui-layer');
const uiTitle = document.getElementById('ui-title');
const uiSubtitle = document.getElementById('ui-subtitle');
const restartBtn = document.getElementById('restart-btn');

// ==== GAME SPRITES AND DATA (Retro Pixel Arrays) ====
// 0 = empty, 1 = colored pixel
const Sprites = {
    player: [
        [0,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,0,0,0,0],
        [0,0,0,0,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1]
    ],
    alien1_A: [ // Top alien (Squid) frame 1
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,0,1,0,0,1,0,0],
        [0,1,0,1,1,0,1,0],
        [1,0,1,0,0,1,0,1]
    ],
    alien1_B: [ // Top alien (Squid) frame 2
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,0,1,0,0,1,0,0],
        [0,1,0,0,0,0,1,0],
        [0,0,1,0,0,1,0,0]
    ],
    alien2_A: [ // Middle alien (Crab) frame 1
        [0,0,1,0,0,0,0,0,1,0,0],
        [0,0,0,1,0,0,0,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,0,0],
        [0,1,1,0,1,1,1,0,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,1,0,1],
        [0,0,0,1,1,0,1,1,0,0,0]
    ],
    alien2_B: [ // Middle alien frame 2
        [0,0,1,0,0,0,0,0,1,0,0],
        [1,0,0,1,0,0,0,1,0,0,1],
        [1,0,1,1,1,1,1,1,1,0,1],
        [1,1,1,0,1,1,1,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,0,0,0,0,0,1,0,0],
        [0,1,0,0,0,0,0,0,0,1,0]
    ],
    alien3_A: [ // Bottom alien (Octopus) frame 1
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,0,0,1,1,0,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,1,1,0,0,1,1,0,0,0],
        [0,0,1,1,0,1,1,0,1,1,0,0],
        [1,1,0,0,0,0,0,0,0,0,1,1]
    ],
    alien3_B: [ // Bottom alien frame 2
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,0,0,1,1,0,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,1,1,1,0,0,1,1,1,0,0],
        [0,1,1,0,0,1,1,0,0,1,1,0],
        [0,0,1,1,0,0,0,0,1,1,0,0]
    ],
    alienExplosion: [
        [0,1,0,0,1,0,0,1,0],
        [1,0,1,0,0,0,1,0,1],
        [0,0,0,1,0,1,0,0,0],
        [0,1,0,0,0,0,0,1,0],
        [0,0,0,1,0,1,0,0,0],
        [1,0,1,0,0,0,1,0,1],
        [0,1,0,0,1,0,0,1,0]
    ],
    ufo: [
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,1,1,1,0,0,1,1,0,0,1,1,1,0,0],
        [0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0]
    ]
};

// AUDIO SYNTHESIS
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    
    if (type === 'shoot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'explosion') {
        // Noise simulation using rapid frequency drop on a square wave
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'ufo') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.linearRampToValueAtTime(1000, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type.startsWith('move')) {
        const pitch = type === 'move1' ? 150 : (type === 'move2' ? 140 : (type === 'move3' ? 130 : 120));
        osc.type = 'square';
        osc.frequency.setValueAtTime(pitch, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    }
}

// ==== GAME STATE ====
const PIXEL_SCALE = 3; // Block multiplier
let drawColor = '#0f0';

let score = 0;
let lives = 3;
let gameState = 'START'; // START, PLAYING, GAMEOVER, WIN

let player = { x: 300, y: 650, width: 11 * PIXEL_SCALE, height: 8 * PIXEL_SCALE, speed: 4 };
let playerBullet = null; // { x, y, active }

// Aliens
let aliens = [];
let alienDirection = 1; // 1 = right, -1 = left
let alienSpeed = 20; // Move every X frames
let alienFrameCount = 0;
let alienAnimToggle = false;
let moveSoundIndex = 1;

let alienBullets = []; // Multiple bullets allowed for enemies

// UFO
let ufo = null;
let ufoTimer = 0;

// Inputs
let keys = {};

window.addEventListener('keydown', e => { 
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) || e.key === ' ') {
        e.preventDefault();
    }
    keys[e.code] = true;
    keys[e.key] = true;
    if ((e.code === 'Enter' || e.code === 'Space' || e.key === ' ') && (gameState === 'GAMEOVER' || gameState === 'WIN' || gameState === 'START')) {
        initGame();
    }
});
window.addEventListener('keyup', e => {
    keys[e.code] = false;
    keys[e.key] = false;
});

// Touch inputs
let touchX = 0;
let isTouching = false;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isTouching = true;
    touchX = e.touches[0].clientX;
    // Auto fire on touch
    if (gameState === 'START' || gameState === 'GAMEOVER' || gameState === 'WIN') initGame();
    else fireBullet();
}, {passive: false});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isTouching && gameState === 'PLAYING') {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        let newX = (e.touches[0].clientX - rect.left) * scaleX;
        player.x = newX - player.width / 2;
    }
}, {passive: false});

canvas.addEventListener('touchend', () => isTouching = false);

// Bunkers (Shields)
let bunkers = [];
const bunkerShape = [
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1],
    [1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1]
];

function createBunkers() {
    bunkers = [];
    const numBunkers = 4;
    const bunkerWidth = bunkerShape[0].length * PIXEL_SCALE;
    const spacing = (canvas.width - (numBunkers * bunkerWidth)) / 5;
    
    for (let i=0; i<numBunkers; i++) {
        // Deep copy shape payload because we destroy pixels individually
        let blockGrid = bunkerShape.map(row => [...row]);
        bunkers.push({
            x: spacing + i * (bunkerWidth + spacing),
            y: 550,
            grid: blockGrid,
            cols: bunkerShape[0].length,
            rows: bunkerShape.length
        });
    }
}

function initAliens() {
    aliens = [];
    const startX = 50;
    const startY = 100;
    for (let row = 0; row < 5; row++) {
        let type;
        if (row === 0) type = 1;
        else if (row === 1 || row === 2) type = 2;
        else type = 3;
        
        for (let col = 0; col < 11; col++) {
            aliens.push({
                x: startX + col * 45,
                y: startY + row * 40,
                type: type,
                active: true,
                points: type === 1 ? 30 : (type === 2 ? 20 : 10)
            });
        }
    }
    alienDirection = 1;
    alienSpeed = 40; // Starts slow
}

function fireBullet() {
    if (!playerBullet || !playerBullet.active) {
        playerBullet = { x: player.x + player.width / 2 - PIXEL_SCALE / 2, y: player.y, active: true };
        playSound('shoot');
    }
}

function update() {
    if (gameState !== 'PLAYING') return;

    // Player Movement
    if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > 0) player.x -= player.speed;
    if ((keys['ArrowRight'] || keys['KeyD']) && player.x < canvas.width - player.width) player.x += player.speed;
    
    // Confine player
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

    // Player Shooting
    if (keys['Space'] || keys[' ']) fireBullet();

    // Bullet physics
    if (playerBullet && playerBullet.active) {
        playerBullet.y -= 10;
        if (playerBullet.y < 0) playerBullet.active = false;
    }

    alienBullets.forEach(b => {
        b.y += 5;
        if (b.y > canvas.height) b.active = false;
    });
    alienBullets = alienBullets.filter(b => b.active);

    // Alien Shooting (Random)
    let activeAliens = aliens.filter(a => a.active);
    if (activeAliens.length > 0 && Math.random() < 0.02) {
        let shooter = activeAliens[Math.floor(Math.random() * activeAliens.length)];
        alienBullets.push({ x: shooter.x + 15, y: shooter.y + 20, active: true });
    }

    // Alien Movement Logic
    alienFrameCount++;
    if (alienFrameCount >= alienSpeed) {
        alienFrameCount = 0;
        alienAnimToggle = !alienAnimToggle;
        
        playSound('move' + moveSoundIndex);
        moveSoundIndex = moveSoundIndex > 3 ? 1 : moveSoundIndex + 1;

        let edgeReached = false;
        activeAliens.forEach(a => {
            if (a.x + 35 > canvas.width - 20 && alienDirection === 1) edgeReached = true;
            if (a.x < 20 && alienDirection === -1) edgeReached = true;
        });

        if (edgeReached) {
            alienDirection *= -1;
            activeAliens.forEach(a => a.y += 20); // Move down
            // Speed up
            if (alienSpeed > 5) alienSpeed -= 5;
        } else {
            activeAliens.forEach(a => a.x += alienDirection * 10);
        }
    }

    // UFO Logic
    if (!ufo && Math.random() < 0.001) {
        let goingRight = Math.random() > 0.5;
        ufo = {
            x: goingRight ? -50 : canvas.width + 50,
            y: 60,
            speed: goingRight ? 3 : -3,
            points: [50, 100, 150, 300][Math.floor(Math.random() * 4)]
        };
    }
    if (ufo) {
        ufo.x += ufo.speed;
        if (ufoFrameCount++ % 15 === 0) playSound('ufo');
        if (ufo.x < -100 || ufo.x > canvas.width + 100) ufo = null;
    }

    // Collisions
    checkCollisions();

    // Check Win/Loss
    if (activeAliens.length === 0) {
        // Next Level!
        initAliens();
        createBunkers();
        lives++; // Reward
    } else {
        // Did they reach bottom?
        const lowestAlien = Math.max(...activeAliens.map(a => a.y));
        if (lowestAlien > 600) {
            lives = 0;
            setGameOver();
        }
    }
}
let ufoFrameCount = 0;

// Pixel perfect bunker collision
function checkBunkerCollision(bullet, type) {
    if(!bullet.active) return false;
    const bw = type === 'player' ? PIXEL_SCALE : PIXEL_SCALE*2;
    const bh = type === 'player' ? 10 : 15;
    
    for (let i = 0; i < bunkers.length; i++) {
        let b = bunkers[i];
        let localX = Math.floor((bullet.x - b.x) / PIXEL_SCALE);
        let localY = Math.floor((bullet.y - b.y) / PIXEL_SCALE);
        
        // Check surrounding pixels to make a destruction crater
        for(let dy=0; dy < 3; dy++) {
            for(let dx=-1; dx < 2; dx++) {
                let cy = localY + dy;
                let cx = localX + dx;
                if(cy >= 0 && cy < b.rows && cx >= 0 && cx < b.cols) {
                    if(b.grid[cy][cx] === 1) {
                        // Destroy pixels
                        b.grid[cy][cx] = 0;
                        if(Math.random() > 0.3) {
                           if(cy+1 < b.rows) b.grid[cy+1][cx] = 0;
                           if(cx+1 < b.cols) b.grid[cy][cx+1] = 0;
                        }
                        bullet.active = false;
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function checkCollisions() {
    // Player bullet hits alien
    if (playerBullet && playerBullet.active) {
        aliens.forEach(a => {
            if (a.active && playerBullet.active &&
                playerBullet.x > a.x && playerBullet.x < a.x + 33 &&
                playerBullet.y > a.y && playerBullet.y < a.y + 24) {
                a.active = false;
                playerBullet.active = false;
                score += a.points;
                playSound('explosion');
                // Speed up slightly as aliens perish
                alienSpeed = Math.max(5, alienSpeed - 0.5); 
            }
        });

        // Player hits UFO
        if (ufo && playerBullet.active && 
            playerBullet.x > ufo.x && playerBullet.x < ufo.x + 48 &&
            playerBullet.y > ufo.y && playerBullet.y < ufo.y + 21) {
            score += ufo.points;
            ufo = null;
            playerBullet.active = false;
            playSound('explosion');
        }
        
        checkBunkerCollision(playerBullet, 'player');
    }

    // Alien bullet hits player or bunkers
    alienBullets.forEach(b => {
        if (!b.active) return;
        
        // Hits player
        if (b.x > player.x && b.x < player.x + player.width &&
            b.y + 15 > player.y && b.y < player.y + player.height) {
            b.active = false;
            lives--;
            playSound('explosion');
            if (lives <= 0) setGameOver();
            else {
                // Flash player or simple respawn
                player.x = 300;
                alienBullets = [];
            }
        }
        checkBunkerCollision(b, 'alien');
    });
}

// Draw Pixel Sprite function
function drawSprite(ctx, sprite, x, y, color) {
    ctx.fillStyle = color;
    for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
            if (sprite[r][c] === 1) {
                ctx.fillRect(x + c * PIXEL_SCALE, y + r * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
            }
        }
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'START') {
        uiLayer.classList.remove('hidden');
        uiTitle.textContent = "SPACE INVADERS";
        uiTitle.style.color = "#0f0";
        uiSubtitle.textContent = "Press SPACE to Start";
        restartBtn.classList.add('hidden');
        return;
    }

    // Draw Bunkers
    ctx.fillStyle = '#0f0';
    bunkers.forEach(b => {
        for (let r = 0; r < b.rows; r++) {
            for (let c = 0; c < b.cols; c++) {
                if (b.grid[r][c] === 1) {
                    ctx.fillRect(b.x + c * PIXEL_SCALE, b.y + r * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                }
            }
        }
    });

    // Draw Player
    drawSprite(ctx, Sprites.player, player.x, player.y, '#0f0');

    // Draw Aliens
    aliens.forEach(a => {
        if (a.active) {
            let sprite;
            if (a.type === 1) sprite = alienAnimToggle ? Sprites.alien1_A : Sprites.alien1_B;
            if (a.type === 2) sprite = alienAnimToggle ? Sprites.alien2_A : Sprites.alien2_B;
            if (a.type === 3) sprite = alienAnimToggle ? Sprites.alien3_A : Sprites.alien3_B;
            drawSprite(ctx, sprite, a.x, a.y, '#fff');
        }
    });

    // Draw UFO
    if (ufo) {
        drawSprite(ctx, Sprites.ufo, ufo.x, ufo.y, '#ff0055');
    }

    // Draw Bullets
    if (playerBullet && playerBullet.active) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(playerBullet.x, playerBullet.y, PIXEL_SCALE, 10);
    }

    ctx.fillStyle = '#fff';
    alienBullets.forEach(b => {
        ctx.fillRect(b.x, b.y, PIXEL_SCALE * 2, 15);
    });

    // GUI
    ctx.font = '20px "Press Start 2P"';
    ctx.fillStyle = '#fff';
    ctx.fillText(`SCORE:${score.toString().padStart(4, '0')}`, 20, 30);
    
    ctx.fillStyle = '#0f0';
    ctx.fillText(`LIVES:${lives}`, canvas.width - 160, 30);

    // Green base line
    ctx.fillRect(0, canvas.height - 5, canvas.width, 5);
}

function setGameOver() {
    gameState = 'GAMEOVER';
    uiLayer.classList.remove('hidden');
    uiTitle.textContent = "GAME OVER";
    uiTitle.style.color = "#f00";
    uiSubtitle.textContent = `SCORE: ${score}`;
    restartBtn.textContent = 'RESTART';
    restartBtn.classList.remove('hidden');
}

function initGame() {
    score = 0;
    lives = 3;
    player.x = 300;
    playerBullet = null;
    alienBullets = [];
    ufo = null;
    uiLayer.classList.add('hidden');
    restartBtn.textContent = 'START';
    
    if (audioCtx.state === 'suspended') audioCtx.resume();

    initAliens();
    createBunkers();
    gameState = 'PLAYING';
}

restartBtn.addEventListener('click', initGame);

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Initial Call
loop();
