// Constants
const PLAYER_SCALE = 0.25;
const PLAYER_SPEED = 20;
const INVADER_SCALE = 1;
const INVADER_SIZE = 30;
const BOTTOM_MARGIN = 60;
const NUM_STARS = 100;
const PROJECTILE_SIZE = 4;
const INVADER_PROJECTILE_WIDTH = 3;
const INVADER_PROJECTILE_HEIGHT = 10;
const INVADER_PROJECTILE_SPEED = 5;
const GRID_SPEED = 5;
const COLUMN_MAX = 10;
const COLUMN_MIN = 5;
const ROW_MAX = 5;
const ROW_MIN = 2;
const STAR_COLOR = 'white';
const keys = {
    a: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

// Selectors
const scoreElement = document.querySelector('#score');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Globals
const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 200);
let game = { over: false, active: true }
let score = 0;

// Make canvas full screen
canvas.width = innerWidth;
canvas.height = innerHeight;

// Helper functions
const createExplosion = ({ obj, color, fades }) => {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: obj.position.x + obj.width / 2,
                y: obj.position.y + obj.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 3,
            color: color || '#BAA0DE',
            fades: fades
        }))
    }
}

const createStars = () => {
    for (let i = 0; i < NUM_STARS; i++) {
        particles.push(new Particle({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            },
            velocity: {
                x: 0,
                y: 1
            },
            radius: Math.random() * 2,
            color: STAR_COLOR
        }))
    }
}

// Animation loop
const animate = () => {
    if (!game.active) return

    requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();

    particles.forEach((particle, index) => {
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = -particle.radius
        }

        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(index, 1);
            }, 0)
        } else {
            particle.update();
        }
    })

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
            }, 0)
        } else invaderProjectile.update();

        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y
            && invaderProjectile.position.x + invaderProjectile.width >= player.position.x
            && invaderProjectile.position.x <= player.position.x + player.width) {

            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
                player.opacity = 0;
                game.over = true;
            }, 0)

            setTimeout(() => {
                game.active = false;
            }, 2000)

            createExplosion({
                obj: player,
                color: 'white',
                fades: true
            })
        }
    })

    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        } else {
            projectile.update();
        }
    })

    grids.forEach((grid, gridIndex) => {
        grid.update();

        // Spawning projectiles
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }

        grid.invaders.forEach((invader, i) => {
            invader.update({ velocity: grid.velocity });

            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height
                    && projectile.position.x + projectile.radius >= invader.position.x
                    && projectile.position.x - projectile.radius <= invader.position.x + invader.width
                    && projectile.position.y + projectile.radius >= invader.position.y) {

                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(inv => inv === invader);
                        const projectileFound = projectiles.find(proj => proj === projectile);

                        if (invaderFound && projectileFound) {
                            score += 100;
                            scoreElement.innerHTML = score;

                            createExplosion({ obj: invader, fades: true});

                            grid.invaders.splice(i, 1);
                            projectiles.splice(j, 1);

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0];
                                const lastInvader = grid.invaders[grid.invaders.length - 1];

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                grid.position.x = firstInvader.position.x;
                            } else {
                                grids.splice(gridIndex, 1);
                            }
                        }
                    }, 0)
                }
            })
        })
    })

    if (keys.a.pressed || keys.ArrowLeft.pressed && player.position.x >= 0) {
        player.velocity.x = -PLAYER_SPEED;
        player.rotation = -0.15;
    } else if (keys.d.pressed || keys.ArrowRight.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = PLAYER_SPEED;
        player.rotation = 0.15;
    } else {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    // Spawning invaders
    if (frames % randomInterval === 0) {
        grids.push(new Grid())
        randomInterval = Math.floor(Math.random() * 500 + 200);
        frames = 0;
    }

    frames++;
}

// Event Listeners
addEventListener('keydown', ({ key }) => {
    if (game.over) return

    switch (key) {
        case 'a':
            keys.a.pressed = true;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case 'd':
            keys.d.pressed = true;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
        case ' ':
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: -20
                }
            }))
            keys.space.pressed = true;
            break;
    }
})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'a':
            keys.a.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case ' ':
            keys.space.pressed = true;
            break;
    }
})

// Invocations
animate();
createStars();