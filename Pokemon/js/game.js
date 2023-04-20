// Selectors
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Constants
const MONITOR_WIDTH = 1024;
const MONITOR_HEIGHT = 576;
const MAP_OFFSET_X = -737;
const MAP_OFFSET_Y = -615;
const PLAYER_SIZE = { width: 192, height: 68 };

// Keys
const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
    ArrowUp: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowDown: { pressed: false },
    ArrowRight: { pressed: false }
}

// Last key pressed and first click of the mouse
let lastKey = '';
let firstClick = false;

// Player's movement speed on the map
let playerSpeed = 3;

// Map of collisions to create boundaries
const collisionsMap = [];

for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, i + 70));
}

// Map of battle zones to create battle sequences
const battleZonesMap = [];

for (let i = 0; i < battleZonesData.length; i += 70) {
    battleZonesMap.push(battleZonesData.slice(i, i + 70));
}

// Creating the map, player, and foreground image elements
const mapImage = new Image();
mapImage.src = './assets/images/PalletTown.png';

const foregroundImage = new Image();
foregroundImage.src = './assets/images/ForegroundObjects.png';

const playerDownImage = new Image();
playerDownImage.src = './assets/images/playerDown.png';

const playerUpImage = new Image();
playerUpImage.src = './assets/images/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './assets/images/playerLeft.png';

const playerRightImage = new Image();
playerRightImage.src = './assets/images/playerRight.png';

// Resizing the canvas
canvas.width = MONITOR_WIDTH;
canvas.height = MONITOR_HEIGHT;

// Classes
class Sprite {
    constructor({
        position,
        image,
        frames = { max: 1, hold: 10 },
        sprites,
        animate = false,
        rotation = 0
    }) {
        this.position = position;
        this.image = new Image();
        this.frames = { ...frames, val: 0, elapsed: 0 };

        // Loading and setting the image
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        }
        this.image.src = image.src;

        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.rotation = rotation;
    }

    draw() {
        ctx.save();

        // Changing the opacity of the sprite
        ctx.globalAlpha = this.opacity;

        // Rotating the sprite by 1 radian from the center of the sprite
        ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);

        ctx.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.width,
            this.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );

        ctx.restore();

        if (!this.animate) return;

        if (this.frames.max > 1) {
            this.frames.elapsed++;
        }

        if (this.frames.elapsed % this.frames.hold === 0) {
            // Iteration for player sprite animation
            if (this.frames.val < this.frames.max - 1) {
                this.frames.val++;
            } else {
                this.frames.val = 0;
            }
        }
    }
}

class Monster extends Sprite {
    constructor({
        position,
        image,
        frames = { max: 1, hold: 10 },
        sprites,
        animate = false,
        rotation = 0,
        isEnemy = false,
        name,
        attacks
    }) {
        super({ position, image, frames, sprites, animate, rotation });

        this.isEnemy = isEnemy;
        this.name = name;
        this.attacks = attacks;
        this.health = 100;
    }

    attack({ attack, recipient, renderedSprites }) {
        // Show the dialogue box with the attack message
        document.querySelector('#dialogueBox').style.display = 'block';
        document.querySelector('#dialogueBox').innerHTML = `${this.name} used ${attack.name}!`;

        // Decrease the recipient's health
        recipient.health -= attack.damage;

        // Recipient's health bar and default rotation
        let healthBar = '#enemyHealthBar';
        let rotation = 1;

        // If the attacker is the enemy, the recipient is the player's pokemon
        if (this.isEnemy) healthBar = '#pokemonHealthBar';

        // If the attacker is the enemy, flip the rotation
        if (this.isEnemy) rotation = -2.2;

        switch (attack.name) {
            case 'Tackle':
                const timeline = gsap.timeline();

                // Attack animation variables
                let movementDistance = 20;

                // If the attacker is the enemy, the recipient is the player's pokemon
                if (this.isEnemy) movementDistance = -20;

                // Creating an animation timeline for the attack
                timeline.to(this.position, {
                    x: this.position.x - movementDistance,
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {
                        // Play tackle audio
                        audio.tackleHit.play();

                        // Decrease the sprite's health by the attack's damage
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })

                        // Animate the sprite back when it gets hit
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })

                        // Change the opacity of the sprite when it gets hit
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })
                break;
            case 'Ember':
                // Play ember audio
                audio.initEmber.play();

                // Creating the ember image element
                const emberImage = new Image();
                emberImage.src = './assets/images/fireball.png';

                const ember = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: emberImage,
                    frames: { max: 4, hold: 10 },
                    animate: true,
                    rotation: rotation
                });

                // Adding ember to the rendered sprites
                renderedSprites.splice(1, 0, ember);

                // Moving ember towards the recipient
                gsap.to(ember.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        // Play ember hit audio
                        audio.emberHit.play();

                        // Decrease the sprite's health by the attack's damage
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })

                        // Animate the sprite back when it gets hit
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })

                        // Change the opacity of the sprite when it gets hit
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })

                        // Remove ember from the rendered sprites
                        renderedSprites.splice(1, 1);
                    }
                })

                break;
        }
    }

    faint() {
        // Show the dialogue box with the faint message
        document.querySelector('#dialogueBox').innerHTML = `${this.name} fainted!`;

        // Fade out the sprite that fainted and move him down
        gsap.to(this.position, {
            y: this.position.y + 20
        });

        gsap.to(this, {
            opacity: 0,
        })

        // Stop battle audio and play fainting audio
        audio.battle.stop();
        audio.victory.play();
    }
}

class Boundary {
    static width = 48;
    static height = 48;

    constructor({ position }) {
        this.position = position;
        this.width = Boundary.width;
        this.height = Boundary.height;
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 0, 0, 0)';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

const map = new Sprite({
    position: {
        x: MAP_OFFSET_X,
        y: MAP_OFFSET_Y
    },
    image: mapImage
})

const foreground = new Sprite({
    position: {
        x: MAP_OFFSET_X,
        y: MAP_OFFSET_Y
    },
    image: foregroundImage
})

const player = new Sprite({
    position: {
        x: canvas.width / 2 - PLAYER_SIZE.width / 8,
        y: canvas.height / 2 - PLAYER_SIZE.height / 2
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
    }
})

// Fill the boundaries of the map using the collisions data
const fillBoundaries = () => {
    const boundaries = [];

    collisionsMap.forEach((row, i) => {
        row.forEach((tileCode, j) => {
            if (tileCode === 1025) {
                boundaries.push(new Boundary({
                    position: {
                        x: j * Boundary.width + MAP_OFFSET_X,
                        y: i * Boundary.height + MAP_OFFSET_Y
                    }
                }))
            };
        })
    })

    return boundaries;
}

// Fill the battle zones of the map using the battle zones data
const fillBattleZones = () => {
    const battleZones = [];

    battleZonesMap.forEach((row, i) => {
        row.forEach((tileCode, j) => {
            if (tileCode === 1025) {
                battleZones.push(new Boundary({
                    position: {
                        x: j * Boundary.width + MAP_OFFSET_X,
                        y: i * Boundary.height + MAP_OFFSET_Y
                    }
                }))
            };
        })
    })

    return battleZones;
}

// Boundaries and battle zones of the map
const boundaries = fillBoundaries();
const battleZones = fillBattleZones();

// Checks if the player is colliding with a boundary
const detectCollision = ({ rectangle1, rectangle2 }) => {
    return rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y;
}

const movables = [map, ...boundaries, foreground, ...battleZones];

const battle = {
    initiated: false
}

// Animation loop
const animate = () => {
    const animationId = requestAnimationFrame(animate);

    // Rendering the map on the canvas
    map.draw();

    // Rendering the boundaries on the canvas
    boundaries.forEach(boundary => {
        boundary.draw()
    });

    // Rendering the battle zones on the canvas
    battleZones.forEach(battleZone => {
        battleZone.draw()
    });

    // Rendering the player on the canvas
    player.draw();

    // Rendering the foreground on the canvas
    foreground.draw();

    // Variables to check if movement should be allowed
    let canMove = true;
    player.animate = false;

    // If player is already in a battle, don't proceed
    if (battle.initiated) return;

    // Activating a battle sequence if the player is in a battle zone
    if (keys.w.pressed || keys.s.pressed || keys.a.pressed || keys.d.pressed ||
        keys.ArrowUp.pressed || keys.ArrowDown.pressed || keys.ArrowLeft.pressed || keys.ArrowRight.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i];

            // Geometrical calculations for getting the area of the rectangle created by the intersection of the player and the battle zone
            const overlappingArea = (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x)) * (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - Math.max(player.position.y, battleZone.position.y));

            if (detectCollision({ rectangle1: player, rectangle2: battleZone }) &&
                overlappingArea > (player.width * player.height) / 2 && Math.random() < 0.01
            ) {
                // Deactivate current animation loop
                cancelAnimationFrame(animationId);

                // Stop the map audio and play the battle audio
                audio.map.stop();
                audio.initBattle.play();
                audio.battle.play();

                battle.initiated = true

                // Initiate the battle sequence
                gsap.to('#battleDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#battleDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                // Setup battle and activate new animation loop
                                setupBattle();
                                animateBattle();

                                // Fade out the battle sequence
                                gsap.to('#battleDiv', {
                                    opacity: 0,
                                    duration: 0.4
                                })
                            }
                        })
                    }
                })
                break;
            }
        }
    }

    // Player movement
    if (keys.w.pressed && lastKey === 'w' || keys.ArrowUp.pressed && lastKey === 'ArrowUp') {
        player.animate = true;
        player.image = player.sprites.up;

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (detectCollision({
                rectangle1: player, rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y + playerSpeed
                    }
                }
            })) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            movables.forEach(movable => movable.position.y += playerSpeed);
        }
    } else if (keys.a.pressed && lastKey === 'a' || keys.ArrowLeft.pressed && lastKey === 'ArrowLeft') {
        player.animate = true;
        player.image = player.sprites.left;

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (detectCollision({
                rectangle1: player, rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x + playerSpeed,
                        y: boundary.position.y
                    }
                }
            })) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            movables.forEach(movable => movable.position.x += playerSpeed);
        }
    } else if (keys.s.pressed && lastKey === 's' || keys.ArrowDown.pressed && lastKey === 'ArrowDown') {
        player.animate = true;
        player.image = player.sprites.down;

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (detectCollision({
                rectangle1: player, rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y - playerSpeed
                    }
                }
            })) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            movables.forEach(movable => movable.position.y -= playerSpeed);
        }
    } else if (keys.d.pressed && lastKey === 'd' || keys.ArrowRight.pressed && lastKey === 'ArrowRight') {
        player.animate = true;
        player.image = player.sprites.right;

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (detectCollision({
                rectangle1: player, rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x - playerSpeed,
                        y: boundary.position.y
                    }
                }
            })) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            movables.forEach(movable => movable.position.x -= playerSpeed);
        }
    }
}

// Starting the animation loop
animate();

// Event listeners
addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = true;
            lastKey = 'ArrowUp';
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            lastKey = 'ArrowLeft';
            break;
        case 'ArrowDown':
            keys.ArrowDown.pressed = true;
            lastKey = 'ArrowDown';
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            lastKey = 'ArrowRight';
            break;
        case 'b':
            playerSpeed = 6;
            break;
        default:
            break;
    }
})

addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowDown':
            keys.ArrowDown.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'b':
            playerSpeed = 3;
            break;
        default:
            break;
    }
})

addEventListener('click', () => {
    if (!firstClick) {
        audio.map.play();
        firstClick = true;
    }
})