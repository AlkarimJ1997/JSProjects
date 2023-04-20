class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
    }

    startGameLoop() {
        const step = () => {
            //Clear the rendering context
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            //Establish the camera person (POV)
            const cameraPerson = this.map.gameObjects.hero;

            // Update all objects
            Object.values(this.map.gameObjects).forEach(gameObject => {
                gameObject.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                });
            })

            // Draw the lower layer of the map
            this.map.drawLowerImage(this.ctx, cameraPerson);

            // Draw the game objects on the map (sorted by y position)
            Object.values(this.map.gameObjects).sort((a, b) => {
                return a.y - b.y;
            }).forEach(gameObject => {
                gameObject.sprite.draw(this.ctx, cameraPerson);
            });

            // Draw the upper layer of the map
            this.map.drawUpperImage(this.ctx, cameraPerson);

            // If the game isn't paused, continue the game loop
            if (!this.map.isPaused) requestAnimationFrame(step);
        }
        step();
    }

    // Method that binds the action inputs (enter, escape)
    bindActionInput() {
        new KeyPressListener("Enter", () => {
            //Is there a person here to talk to?
            this.map.checkForActionCutscene()
        })

        new KeyPressListener("Escape", () => {
            // If there is no cutscene playing, pause the game
            if (!this.map.isCutscenePlaying) {
                this.map.startCutscene([
                    { type: "pause" }
                ])
            }
        })
    }

    // Method that checks if the hero is on a cutscene position on the map
    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if (e.detail.whoId === "hero") {
                // Hero's position has changed (check for cutscenes)
                this.map.checkForFootstepCutscene();
            }
        })
    }

    // Method to start a map and mount the game objects
    startMap(mapConfig, heroInitialState = null) {
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();

        // If the hero has an initial state for when they enter the map, set it
        if (heroInitialState) {
            const { hero } = this.map.gameObjects;

            // Update the wall the hero was on and will be on while setting
            this.map.removeWall(hero.x, hero.y);
            hero.x = heroInitialState.x;
            hero.y = heroInitialState.y;
            hero.direction = heroInitialState.direction;
            this.map.addWall(hero.x, hero.y);
        }

        // Save the map and its state to the player's progress
        this.progress.mapId = mapConfig.id;
        this.progress.startingHeroX = this.map.gameObjects.hero.x;
        this.progress.startingHeroY = this.map.gameObjects.hero.y;
        this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
    }

    async init() {
        // Get a reference to the game container
        const gameContainer = document.querySelector(".game-container");

        // Initialize the player's progress tracker
        this.progress = new Progress();

        // Initialize the Title Screen for Pizza Legends
        this.titleScreen = new TitleScreen({
            progress: this.progress
        })
        const useSaveFile = await this.titleScreen.init(gameContainer);

        // Potentially load saved data
        let initialHeroState = null;

        if (useSaveFile) {
            this.progress.load();
            initialHeroState = {
                x: this.progress.startingHeroX,
                y: this.progress.startingHeroY,
                direction: this.progress.startingHeroDirection,
            }
        }

        // Initialize the overworld HUD
        this.hud = new Hud();
        this.hud.init(gameContainer);

        // Initialize the map (that the player was on)
        this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

        // Initialize the action inputs (enter, escape)
        this.bindActionInput();

        // Initialize the hero (position) check
        this.bindHeroPositionCheck();

        // Initialize the movement input handler
        this.directionInput = new DirectionInput();
        this.directionInput.init();

        // Initiate the game loop
        this.startGameLoop();

        // this.map.startCutscene([
        //   { type: "battle", enemyId: "beth" }
        //   // { type: "changeMap", map: "DemoRoom"}
        //   // { type: "textMessage", text: "This is the very first message!"}
        // ])

    }
}