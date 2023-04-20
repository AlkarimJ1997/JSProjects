/* Globals

- players
- coins = x and y coordinates
- playerElements, coinElements = DOM elements

*/
let playerId;
let playerRef;
let players = {};
let playerElements = {};
let coins = {};
let coinElements = {};

// Selectors
const gameContainer = document.querySelector(".game-container");
const playerNameInput = document.querySelector("#player-name");
const playerColorButton = document.querySelector("#player-color");

// Constant for player colors
const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];

// Constant for map data (blocked spaces, walls, boundaries, etc.)
const mapData = {
    minX: 1,
    maxX: 14,
    minY: 4,
    maxY: 12,
    blockedSpaces: {
        "7x4": true,
        "1x11": true,
        "12x10": true,
        "4x7": true,
        "5x7": true,
        "6x7": true,
        "8x6": true,
        "9x6": true,
        "10x6": true,
        "7x9": true,
        "8x9": true,
        "9x9": true,
    }
}

// Helper functions
const randomFromArray = array => {
    return array[Math.floor(Math.random() * array.length)];
}

const getKeyString = (x, y) => {
    return `${x}x${y}`;
}

const createName = () => {
    const prefix = randomFromArray([
        "COOL",
        "SUPER",
        "HIP",
        "SMUG",
        "COOL",
        "SILKY",
        "GOOD",
        "SAFE",
        "DEAR",
        "DAMP",
        "WARM",
        "RICH",
        "LONG",
        "DARK",
        "SOFT",
        "BUFF",
        "DOPE",
    ]);

    const animal = randomFromArray([
        "BEAR",
        "DOG",
        "CAT",
        "FOX",
        "LAMB",
        "LION",
        "BOAR",
        "GOAT",
        "VOLE",
        "SEAL",
        "PUMA",
        "MULE",
        "BULL",
        "BIRD",
        "BUG",
    ])

    return `${prefix} ${animal}`;
}

const updatePlayerDOM = (element, playerConfig) => {
    element.querySelector(".Character_name").innerText = playerConfig.name;
    element.querySelector(".Character_coins").innerText = playerConfig.coins;
    element.setAttribute("data-color", playerConfig.color);
    element.setAttribute("data-direction", playerConfig.direction);

    // Update the player's position
    const left = 16 * playerConfig.x + "px";
    const top = 16 * playerConfig.y - 4 + "px";

    element.style.transform = `translate3d(${left}, ${top}, 0)`;
}

const isSolid = (x, y) => {
    const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];

    return (
        x < mapData.minX || x >= mapData.maxX || y < mapData.minY || y >= mapData.maxY || blockedNextSpace
    )
}

const getRandomSafeSpot = () => {
    let x = 0;
    let y = 0;

    do {
        x = Math.floor(Math.random() * (mapData.maxX - mapData.minX + 1)) + mapData.minX;
        y = Math.floor(Math.random() * (mapData.maxY - mapData.minY + 1)) + mapData.minY;
    } while (isSolid(x, y));

    return { x, y };
}

// Method to add coins to the game
const placeCoin = () => {
    const { x, y } = getRandomSafeSpot();
    const coinRef = firebase.database().ref(`coins/${getKeyString(x, y)}`);

    // Add the coin to Firebase
    coinRef.set({ x, y });

    // Random setTimeouts to simulate coin placement
    const coinTimeouts = [2000, 3000, 4000, 5000];

    setTimeout(() => {
        placeCoin();
    }, randomFromArray(coinTimeouts));
}

// Method to handle coin collection
const attemptGrabCoin = (x, y) => {
    const keySpace = getKeyString(x, y);

    // Check if the player is trying to collect a coin
    if (coins[keySpace]) {
        // Remove the coin from Firebase, then uptick the player's coin count
        firebase.database().ref(`coins/${keySpace}`).remove();
        playerRef.update({ coins: players[playerId].coins + 1 });
    }
}

// Method to handle arrow key events
const handleArrowPress = (xChange = 0, yChange = 0) => {
    const newX = players[playerId].x + xChange;
    const newY = players[playerId].y + yChange;

    // Check if the player is trying to move out of the world, into the wall, or into another player
    if (!isSolid(newX, newY)) {
        // Move to the next space
        players[playerId].x = newX;
        players[playerId].y = newY;

        // Change the players direction based on the change in x
        if (xChange === 1) players[playerId].direction = "right";
        if (xChange === -1) players[playerId].direction = "left";

        // Update the player's reference in Firebase (will callback the "value" listener)
        playerRef.set(players[playerId]);

        // Check if the player has collected a coin
        attemptGrabCoin(newX, newY);
    }
}

// Method to initialize the game
const initGame = () => {
    // keypress listeners for arrow events
    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

    // Reference to all players and coins in the world
    const allPlayersRef = firebase.database().ref("/players");
    const allCoinsRef = firebase.database().ref("/coins");

    // Callback listeners for all players
    allPlayersRef.on("value", snapshot => {
        // Fires when a value is changed
        players = snapshot.val() || {};

        // Loop through all players
        Object.keys(players).forEach(key => {
            const characterState = players[key];

            // Reference the player's DOM element on screen and update it (since something changed)
            updatePlayerDOM(playerElements[key], characterState);
        })
    })

    allPlayersRef.on("child_added", snapshot => {
        // Fires when a new node is added to the tree
        const addedPlayer = snapshot.val();

        // Create a new div for the player
        const characterElement = document.createElement("div");
        characterElement.classList.add("Character", "grid-cell");

        // If this is the player's own character, add the "you" class (for CSS)
        if (addedPlayer.id === playerId) characterElement.classList.add("you");

        characterElement.innerHTML = (`
                <div class="Character_shadow grid-cell"></div>
                <div class="Character_sprite grid-cell"></div>
                <div class="Character_name-container">
                    <span class="Character_name"></span>
                    <span class="Character_coins">0</span>
                </div>
                <div class="Character_you-arrow"></div>
            `
        );

        // Add player to the list of players
        playerElements[addedPlayer.id] = characterElement;

        // Fill initial state of the player (into the DOM) and data attributes for CSS
        updatePlayerDOM(characterElement, addedPlayer);

        // Append the player to the DOM
        gameContainer.appendChild(characterElement);
    })

    allPlayersRef.on("child_removed", snapshot => {
        // Fires when a node is removed from the tree
        const removedPlayer = snapshot.val();

        // Remove the player from the DOM and the list of players
        gameContainer.removeChild(playerElements[removedPlayer.id]);
        delete playerElements[removedPlayer.id];
    })

    allCoinsRef.on("child_added", snapshot => {
        // Fires when a new node is added to the tree
        const coin = snapshot.val();
        const key = getKeyString(coin.x, coin.y);

        // Add coin's x and y to the list of coins
        coins[key] = true;

        // Create a new div for the coin
        const coinElement = document.createElement("div");
        coinElement.classList.add("Coin", "grid-cell");
        coinElement.innerHTML = (`
                <div class="Coin_shadow grid-cell"></div>
                <div class="Coin_sprite grid-cell"></div>
            `
        )

        // Positioning for the coin
        const left = 16 * coin.x + "px";
        const top = 16 * coin.y - 4 + "px";

        coinElement.style.transform = `translate3d(${left}, ${top}, 0)`;

        // Add coin to the list of coins
        coinElements[key] = coinElement;

        // Append the coin to the DOM
        gameContainer.appendChild(coinElement);
    })

    allCoinsRef.on("child_removed", snapshot => {
        // Fires when a node is removed from the tree
        const { x, y } = snapshot.val();
        const coinKey = getKeyString(x, y);

        // Remove the coin from the DOM and the list of coins
        gameContainer.removeChild(coinElements[coinKey]);
        delete coinElements[coinKey];
    })

    // Event listener for name input field
    playerNameInput.addEventListener("change", () => {
        // Update the player's name in Firebase
        playerRef.update({ name: playerNameInput.value || createName() });
    })

    // Event listener for color button
    playerColorButton.addEventListener("click", () => {
        // Increment current color to next available color
        const myColorIndex = playerColors.indexOf(players[playerId].color);
        const nextColor = playerColors[myColorIndex + 1] || playerColors[0];

        // Update the player's color in Firebase
        playerRef.update({ color: nextColor });
    })

    // Begin coin placement
    placeCoin();
}

// Method to initialize Firebase
const initFirebase = () => {
    // Authentication listener
    firebase.auth().onAuthStateChanged(user => {
        console.log(user);
        if (user) {
            // User is signed in.
            playerId = user.uid;
            playerRef = firebase.database().ref(`/players/${playerId}`);

            // Unique data for each player
            const name = createName();

            // Set the input field to the random name
            playerNameInput.value = name;

            // Random x and y coordinates for the player
            const { x, y } = getRandomSafeSpot();

            // Write player data to the database using the player's ref
            playerRef.set({
                id: playerId,
                name,
                direction: "right",
                color: randomFromArray(playerColors),
                x,
                y,
                coins: 0
            })

            // Remove player from the database when the user disconnects
            playerRef.onDisconnect().remove();

            // Begin the game now that the user is signed in
            initGame();

        } else {
            // User is logged out
        }
    });

    // Log into firebase
    firebase.auth().signInAnonymously().catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorCode, errorMessage);
    })
};

// Initialize the user to Firebase
initFirebase();