// Selectors
const canvas = document.querySelector("canvas");
const tilesetContainer = document.querySelector(".tileset-container");
const tilesetSelection = document.querySelector(".tileset-container_selection");
const tilesetImage = document.querySelector("#tileset-source");

// Which tile will be painted (x and y), and the current layer
let selection = [0, 0];
let currentLayer = 0;

// Flag for if the mouse is clicked down (for the canvas)
let isMouseDown = false;

let layers = [
    // Bottom
    {
        // Structure is "x-y": ["tileset_x", "tileset_y"]
        // EXAMPLE: "1-1": [3, 4], - drawn at 1, 1 using tile 3, 4
        "0-0": [0, 0]
    },
    // Middle
    {

    },
    // Top
    {

    }
];

// Method to draw tiles on the canvas
const draw = () => {
    // Get a reference to the context
    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // tileset cropping
    const sizeOfCrop = 32;

    layers.forEach(layer => {
        Object.keys(layer).forEach(key => {
            // Get x and y from the key
            const [x, y] = key.split("-").map(Number);
            const [tilesetX, tilesetY] = layer[key];

            // Draw the specific tile at the x and y position on the canvas
            ctx.drawImage(
                tilesetImage, // image to draw
                tilesetX * sizeOfCrop, tilesetY * sizeOfCrop, // where to start clipping from
                sizeOfCrop, sizeOfCrop, // how much to clip
                x * sizeOfCrop, y * sizeOfCrop, // where to draw on the canvas
                sizeOfCrop, sizeOfCrop // how big to draw the clipped image
            );
        })
    })
}

// Take a canvas click event and get the x and y coordinates from the top left corner (in pixels)
const getCoords = e => {
    const { x, y } = e.target.getBoundingClientRect();
    const mouseX = e.clientX - x;
    const mouseY = e.clientY - y;

    return [Math.floor(mouseX / 32), Math.floor(mouseY / 32)];
}

// Method to add a tile to the current layer of the canvas
const addTile = mouseEvent => {
    // Get the x and y coordinates from the click event
    const [x, y] = getCoords(mouseEvent);

    // If the shift key is held down, remove the tile from that position, else add it
    if (mouseEvent.shiftKey) {
        delete layers[currentLayer][`${x}-${y}`];
    } else {
        layers[currentLayer][`${x}-${y}`] = selection;
    }

    draw();
}

// Method to update the current layer of the canvas
const setLayer = newLayer => {
    // Update the current layer
    currentLayer = newLayer;

    // Update the UI to reflect the current layer
    let oldActiveLayer = document.querySelector(".layer.active");

    if (oldActiveLayer) oldActiveLayer.classList.remove("active");

    document.querySelector(`[tile-layer="${currentLayer}"]`).classList.add("active");
}

// Method to clear the canvas when the clear button is clicked
const clearCanvas = () => {
    // Clear the layers
    layers = [
        // Bottom
        {},
        // Middle
        {},
        // Top
        {}
    ];

    // Draw the tiles on the canvas (clears any tiles that were on the canvas)
    draw();
}

// Method to export the canvas image as a PNG when the export button is clicked
const exportImage = () => {
    // Get the canvas' context as a data URL
    const data = canvas.toDataURL();

    // Create a new image, sourced with the data URL
    const image = new Image();
    image.src = data;

    // Open a new tab with the image
    const w = window.open("");
    w.document.write(image.outerHTML);
}

// Mousedown event listener for the tileset
tilesetContainer.addEventListener("mousedown", event => {
    // Set the x and y coordinates of the clicked tile to the current selection
    selection = getCoords(event);

    // Move the selected outline to the clicked tile
    tilesetSelection.style.left = selection[0] * 32 + "px";
    tilesetSelection.style.top = selection[1] * 32 + "px";
})

// Event listeners for the canvas
canvas.addEventListener("mousedown", () => {
    isMouseDown = true;
});

canvas.addEventListener("mouseup", () => {
    isMouseDown = false;
})

// Edge case for if the user clicks on the canvas and drags off of it (won't trigger the mouseup event)
canvas.addEventListener("mouseleave", () => {
    isMouseDown = false;
})

// Event listeners for drawing tile on the canvas
canvas.addEventListener("mousedown", addTile);
canvas.addEventListener("mousemove", event => {
    if (isMouseDown) addTile(event);
});

const defaultState = [
    {
        // Bottom layer
        "0-4": [3, 2], "1-4": [4, 2], "2-4": [4, 2], "3-4": [4, 2],
        "4-4": [4, 1], "5-5": [4, 2], "6-5": [4, 2], "7-5": [4, 2],
        "8-5": [4, 2], "9-5": [4, 2], "10-5": [4, 2], "11-6": [3, 2],
        "12-6": [4, 2], "13-6": [4, 2], "14-6": [4, 2], "12-5": [4, 1],
        "5-4": [4, 1], "3-3": [4, 1], "0-3": [4, 1], "1-3": [4, 1],
        "4-3": [4, 1], "5-3": [4, 1], "7-3": [4, 1], "8-3": [4, 1],
        "9-3": [4, 1], "10-3": [4, 1], "10-4": [4, 1], "11-4": [4, 1],
        "11-5": [4, 1], "4-5": [3, 2], "2-3": [4, 1], "6-3": [4, 1],
        "11-3": [4, 1], "12-3": [4, 1], "13-3": [4, 1], "14-3": [4, 1],
        "6-4": [4, 1], "7-4": [4, 1], "8-4": [4, 1], "9-4": [4, 1],
        "12-4": [4, 1], "13-4": [4, 1], "14-4": [4, 1], "13-5": [4, 1],
        "14-5": [4, 1], "14-2": [4, 1], "13-2": [4, 1], "12-2": [4, 1],
        "11-2": [4, 1], "10-2": [4, 1], "9-2": [4, 1], "8-2": [4, 1],
        "7-2": [4, 1], "6-2": [4, 1], "5-2": [4, 1], "4-2": [4, 1],
        "3-2": [4, 1], "2-2": [4, 1], "1-2": [4, 1], "0-2": [4, 1],
        "0-1": [4, 1], "1-1": [4, 1], "2-1": [4, 1], "3-1": [4, 1],
        "4-1": [4, 1], "6-1": [4, 1], "8-1": [4, 1], "9-1": [4, 1],
        "10-1": [4, 1], "11-1": [4, 1], "12-1": [4, 1], "13-1": [4, 1],
        "14-1": [4, 1], "7-1": [4, 1], "5-1": [4, 1], "0-0": [4, 1],
        "1-0": [4, 1], "2-0": [4, 1], "3-0": [4, 1], "4-0": [4, 1],
        "5-0": [4, 1], "6-0": [4, 1], "7-0": [4, 1], "8-0": [4, 1],
        "9-0": [4, 1], "10-0": [4, 1], "11-0": [4, 1], "12-0": [4, 1],
        "13-0": [4, 1], "14-0": [4, 1], "14-14": [2, 6], "7-14": [3, 6],
        "6-14": [2, 6], "5-14": [3, 6], "4-13": [3, 6], "3-13": [2, 6],
        "1-11": [2, 10], "1-10": [2, 10], "0-8": [0, 6], "0-10": [2, 10],
        "3-10": [3, 6], "4-10": [2, 6], "0-5": [3, 6], "0-6": [0, 6],
        "0-7": [1, 6], "0-9": [1, 6], "0-11": [2, 10], "0-12": [2, 10],
        "0-13": [2, 10], "0-14": [0, 6], "1-14": [1, 6], "1-13": [2, 10],
        "1-12": [3, 6], "1-9": [2, 6], "1-8": [1, 6], "1-7": [0, 6],
        "1-6": [3, 6], "1-5": [2, 6], "2-5": [3, 6], "2-6": [2, 6],
        "2-7": [3, 6], "2-8": [0, 6], "2-9": [3, 6], "2-13": [2, 10],
        "2-14": [0, 6], "3-14": [1, 6], "3-12": [3, 6], "3-11": [2, 6],
        "3-9": [2, 6], "3-8": [3, 6], "3-7": [2, 6], "3-6": [3, 6],
        "3-5": [2, 6], "4-6": [2, 6], "4-7": [3, 6], "4-8": [2, 6],
        "4-9": [3, 6], "4-11": [3, 6], "4-12": [2, 6], "4-14": [2, 6],
        "5-13": [2, 6], "5-12": [4, 10], "5-11": [4, 10], "5-10": [4, 10],
        "5-9": [4, 10], "5-8": [3, 6], "5-7": [2, 6], "5-6": [3, 6],
        "6-6": [2, 6], "6-7": [3, 6], "6-8": [2, 6], "6-9": [4, 10],
        "6-10": [4, 10], "6-11": [4, 10], "6-12": [4, 10], "6-13": [3, 6],
        "7-13": [2, 6], "7-12": [4, 10], "7-10": [4, 10], "7-9": [4, 10], 
        "7-8": [3, 6], "7-7": [2, 6], "7-6": [3, 6], "8-6": [2, 6], 
        "8-7": [3, 6], "8-10": [4, 10], "8-11": [4, 10], "8-12": [4, 10], 
        "8-14": [2, 6], "8-13": [3, 6], "9-14": [3, 6], "9-13": [2, 6], 
        "9-12": [4, 10], "9-11": [4, 10], "9-10": [4, 10], "9-7": [2, 6], 
        "9-6": [3, 6], "10-7": [3, 6], "10-8": [2, 6], "10-9": [3, 6], 
        "10-10": [2, 6], "10-11": [3, 6], "10-12": [2, 6], "10-13": [3, 6], 
        "10-14": [2, 6], "10-6": [2, 6], "11-7": [2, 6], "12-7": [3, 6],
        "13-7": [2, 6], "14-7": [2, 6], "14-8": [2, 6], "14-9": [3, 6], 
        "14-10": [4, 3], "14-11": [4, 4], "14-12": [2, 6], "14-13": [3, 6], 
        "13-14": [3, 6], "12-14": [2, 6], "11-14": [3, 6], "11-13": [2, 6], 
        "12-13": [3, 6], "13-13": [2, 6], "13-12": [3, 6], "12-12": [2, 6], 
        "11-12": [3, 6], "11-11": [2, 6], "12-11": [3, 6], "13-11": [4, 4], 
        "13-10": [2, 6], "12-10": [2, 6], "11-10": [3, 6], "12-9": [3, 6], 
        "13-9": [2, 6], "13-8": [3, 6], "12-8": [2, 6], "11-9": [2, 6], 
        "11-8": [3, 6], "2-10": [2, 10], "2-11": [2, 10], "2-12": [2, 10], 
        "8-9": [4, 10], "8-8": [4, 10], "9-9": [4, 10], "9-8": [4, 10], "7-11": [4, 10]
    },
    {
        // Middle layer
        "5-9": [2, 7], "6-9": [2, 7], "7-9": [2, 7], "3-9": [0, 6], 
        "3-11": [0, 6], "3-13": [0, 6], "1-9": [0, 6], "2-9": [1, 6], 
        "1-10": [1, 7], "3-10": [1, 6], "3-12": [1, 6], "2-10": [1, 7], 
        "1-12": [2, 10], "0-8": [1, 2], "1-8": [1, 2], "2-8": [1, 2], 
        "2-7": [2, 1], "2-6": [2, 0], "1-6": [1, 0], "0-6": [1, 0], 
        "1-7": [1, 1], "0-7": [1, 1], "11-11": [3, 3], "12-11": [4, 3], 
        "13-11": [4, 4], "14-11": [4, 4], "11-12": [3, 4], "11-13": [3, 5], 
        "12-13": [4, 5], "13-13": [4, 5], "14-13": [4, 5], "12-12": [4, 4], 
        "13-12": [4, 4], "14-12": [4, 4], "0-10": [0, 7], "13-10": [3, 3], 
        "11-5": [3, 1], "4-4": [3, 1], "8-8": [2, 7], "9-8": [2, 7]
    }, {
        // Top layer
        "0-5": [4, 12], "1-5": [4, 12], "2-5": [4, 12], "3-5": [4, 12], 
        "4-6": [4, 12], "5-6": [4, 12], "6-6": [4, 12], "7-6": [4, 12], 
        "8-6": [4, 12], "9-6": [4, 12], "10-6": [4, 12], "11-7": [4, 12], 
        "12-7": [4, 12], "13-7": [4, 12], "14-7": [4, 12], "0-9": [4, 12], 
        "1-9": [4, 12], "2-9": [4, 12], "11-14": [4, 12], "12-14": [4, 12], 
        "13-14": [4, 12], "14-14": [4, 12], "6-2": [2, 15], "6-3": [0, 13], 
        "7-3": [3, 12], "8-3": [0, 14], "9-3": [1, 16], "10-3": [1, 15], 
        "11-3": [4, 15], "4-2": [4, 14], "5-2": [0, 12], "4-1": [0, 13], 
        "3-1": [3, 14], "1-1": [1, 16], "2-1": [0, 14], "11-1": [4, 2], 
        "12-1": [4, 2], "13-1": [5, 2], "11-0": [4, 0], "12-0": [4, 0], 
        "13-0": [5, 0], "10-1": [4, 2], "9-1": [3, 2], "10-0": [4, 0], 
        "9-0": [3, 0], "9-2": [4, 12], "10-2": [4, 12], "11-2": [4, 12], 
        "12-2": [4, 12], "13-2": [4, 12], "5-13": [4, 13], "9-13": [5, 13], 
        "6-13": [4, 11], "7-13": [4, 11], "8-13": [4, 11], "0-14": [4, 11], 
        "1-14": [4, 11], "2-14": [5, 13]
    }
];

// Initialize the canvas, layers, and remaining elements after the image is loaded
tilesetImage.onload = () => {
    // Load the default state to be drawn on the canvas (looks better than a blank canvas)
    layers = defaultState;

    // Draw the tiles on the canvas
    draw();

    // Set the current layer to the bottom layer
    setLayer(0);
}

// Set the tilset image
tilesetImage.src = "https://assets.codepen.io/21542/TileEditorSpritesheet.2x_2.png";