class Progress {
    constructor() {
        this.mapId = "Kitchen";
        this.startingHeroX = 0;
        this.startingHeroY = 0;
        this.startingHeroDirection = "down";
        this.saveFileKey = "PizzaLegends_SaveFile1";
    }

    // Method to save the player's progress in the game (to local storage)
    save() {
        window.localStorage.setItem(this.saveFileKey, JSON.stringify({
            mapId: this.mapId,
            startingHeroX: this.startingHeroX,
            startingHeroY: this.startingHeroY,
            startingHeroDirection: this.startingHeroDirection,
            playerState: {
                pizzas: playerState.pizzas,
                lineup: playerState.lineup,
                items: playerState.items,
                storyFlags: playerState.storyFlags
            }
        }));
    }

    // Method to get any save data that exists (to be loaded) from local storage
    getSaveFile() {
        try {
            const file = window.localStorage.getItem(this.saveFileKey);

            return file ? JSON.parse(file) : null
        } catch {
            return null;
        }
    }

    // Method to load the player's progress when the game starts
    load() {
        const file = this.getSaveFile();

        // If save data exists, load it
        if (file) {
            this.mapId = file.mapId;
            this.startingHeroX = file.startingHeroX;
            this.startingHeroY = file.startingHeroY;
            this.startingHeroDirection = file.startingHeroDirection;

            // Load the player's state
            Object.keys(file.playerState).forEach(key => {
                playerState[key] = file.playerState[key];
            })
        }
    }
}