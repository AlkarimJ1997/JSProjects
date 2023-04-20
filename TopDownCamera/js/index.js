// Selectors
const character = document.querySelector('.character');
const map = document.querySelector('.map');

// Dictionaries for the key codes and directions
const directions = {
    left: 'left',
    up: 'up',
    right: 'right',
    down: 'down'
}

const keys = {
    37: directions.left,
    38: directions.up,
    39: directions.right,
    40: directions.down
}

// X and Y coordinates for middle of the map
// let x = 90;
// let y = 34;
let x = 370;
let y = 250;

// State of which arroy keys are being pressed
let heldDirections = [];

// Speed of the character (pixels per frame)
let speed = 1;

// Places the character on the map
const placeCharacter = () => {
    // Gets the pixel size CSS attribute from the document element
    // and converts it to a number
    let pixelSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pixel-size'));

    // Moves the character based on the key being pressed
    const heldDirection = heldDirections[0];

    if (heldDirection) {
        // Moves the character's current position based on the direction
        switch (heldDirection) {
            case directions.left:
                x -= speed;
                break;
            case directions.up:
                y -= speed;
                break;
            case directions.right:
                x += speed;
                break;
            case directions.down:
                y += speed;
                break;
            default:
                break;
        }
        // Sets the character's facing attribute to the direction
        character.setAttribute("facing", heldDirection);
    }

    // Sets the character's walking attribute to true if the character is moving
    character.setAttribute('walking', heldDirections.length > 0);

    // Sets the boundaries of the map (giving the illusion of walls)
    // const limits = {
    //     left: -8,
    //     right: (16 * 11) + 8,
    //     top: -8 + 32,
    //     bottom: (16 * 7)
    // }
    const limits = {
        left: -8,
        right: (16 * 25) + 8,
        top: -8 + 32,
        bottom: (16 * 23)
    }

    // Stops the character from moving off the map
    if (x < limits.left) x = limits.left;
    if (x > limits.right) x = limits.right;
    if (y < limits.top) y = limits.top;
    if (y > limits.bottom) y = limits.bottom;

    let cameraLeft = pixelSize * 66;
    let cameraTop = pixelSize * 42;

    // Moves the map's position and character's position with translate3D
    map.style.transform = `translate3D(${-x * pixelSize + cameraLeft}px, ${-y * pixelSize + cameraTop}px, 0)`;
    character.style.transform = `translate3D(${x * pixelSize}px, ${y * pixelSize}px, 0)`;
}

// Animation loop for the game
const gameLoop = () => {
    placeCharacter();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

// Event listeners
addEventListener("keydown", e => {
    let dir = keys[e.keyCode];

    if (dir && !heldDirections.includes(dir)) {
        heldDirections.unshift(dir);
    }
})

addEventListener("keyup", e => {
    let dir = keys[e.keyCode];
    let index = heldDirections.indexOf(dir);

    if (index > -1) {
        heldDirections.splice(index, 1);
    }
})