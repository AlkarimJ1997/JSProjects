class OverworldEvent {
    constructor({ map, event }) {
        this.map = map;
        this.event = event;
    }

    // Starts the stand event for the game object
    stand(resolve) {
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({ map: this.map }, {
            type: "stand",
            direction: this.event.direction,
            time: this.event.time
        });

        // Completion handler for the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("PersonStandComplete", completeHandler);
    }

    // Starts the walk event for the game object
    walk(resolve) {
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({ map: this.map }, {
            type: "walk",
            direction: this.event.direction,
            retry: true
        })

        // Completion handler for the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("PersonWalkingComplete", completeHandler)
    }

    // Starts the "goToNPC" event for the game object
    goToNPC(resolve) {
        const who = this.map.gameObjects[this.event.who];
        const target = this.map.gameObjects[this.event.target];

        // Direction for hero to move
        let direction = null;

        // If the hero is already at the target, set the correct direction and resolve the entire event
        const result = utils.withinOneTile(utils.nextPosition(who.x, who.y, direction), target);

        if (result.within) {
            // Set the hero's direction and the NPC's direction, then resolve the event
            who.direction = result.direction;
            target.direction = utils.oppositeDirection(result.direction);

            // Resolve the event
            resolve();
            return;
        }

        // Get the direction for the hero to move to get to the target NPC (if not already there)
        direction = utils.getDirection(who, target);

        // Move the hero one step towards the target NPC
        who.startBehavior({ map: this.map }, {
            type: "walk",
            direction,
            retry: true
        });

        // Hero has finished walking, resolve the walking event, and start again
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler);
                this.goToNPC(resolve);
            }
        }

        document.addEventListener("PersonWalkingComplete", completeHandler);
    }

    // Starts the jump event for the game object
    async jump(resolve) {
        const who = this.map.gameObjects[this.event.who];

        // Make the person jump by setting its jump height
        who.sprite.jumpHeight = 10;

        // Wait a litle bit, then reset the jump height
        await utils.wait(300);
        who.sprite.jumpHeight = 0;

        // Resolve the event
        resolve();
    }

    // // Starts the follow event for the game object
    // follow(resolve) {
    //     const who = this.map.gameObjects[this.event.who];
    //     const follower = this.map.gameObjects[this.event.follower];

    //     // Get the direction to move
    //     const direction = this.event.direction

    //     // First move the NPC who is leading the hero
    //     who.startBehavior({ map: this.map }, {
    //         type: "walk",
    //         direction,
    //         retry: true
    //     });

    //     // Wait for the NPC to finish walking
    //     const completeHandler = e => {
    //         if (e.detail.whoId === this.event.who) {
    //             document.removeEventListener("PersonWalkingComplete", completeHandler);
    //         }
    //     }

    //     document.addEventListener("PersonWalkingComplete", completeHandler);

    //     // Move the follower
    //     follower.startBehavior({ map: this.map }, {
    //         type: "walk",
    //         direction,
    //         retry: true
    //     });

    //     // Wait for the follower to finish walking
    //     const followerCompleteHandler = e => {
    //         if (e.detail.whoId === this.event.follower) {
    //             document.removeEventListener("PersonWalkingComplete", followerCompleteHandler);
    //             resolve();
    //         }
    //     }

    //     document.addEventListener("PersonWalkingComplete", followerCompleteHandler);
    // }

    // Starts the text message event for the overworld
    textMessage(resolve) {
        // If the event has a faceHero flag, make the NPC face the hero
        // Note: If the hero is facing right, the NPC will face left, etc.
        if (this.event.faceHero) {
            const NPC = this.map.gameObjects[this.event.faceHero];
            NPC.direction = utils.oppositeDirection(this.map.gameObjects.hero.direction);
        }

        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve()
        });

        message.init(document.querySelector(".game-container"))
    }

    // Starts the change map event for the overworld
    changeMap(resolve) {
        // Creates a fade in effect for the map change
        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), () => {
            this.map.overworld.startMap(window.OverworldMaps[this.event.map], {
                x: this.event.x,
                y: this.event.y,
                direction: this.event.direction,
            });
            resolve();

            sceneTransition.fadeOut();
        });
    }

    // Starts the battle event for the overworld
    battle(resolve) {
        const battle = new Battle({
            enemy: Enemies[this.event.enemyId],
            arena: this.event.arena || null,
            onComplete: (didWin) => {
                resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE");
            }
        });

        battle.init(document.querySelector(".game-container"));
    }

    // Starts the pause event for the overworld (bring up the pause menu)
    pause(resolve) {
        this.map.isPaused = true;

        // Create the pause menu
        const menu = new PauseMenu({
            hero: this.map.gameObjects.hero,
            progress: this.map.overworld.progress,
            onComplete: () => {
                resolve();

                // Unpause the game and resume the game loop
                this.map.isPaused = false;
                this.map.overworld.startGameLoop();
            }
        });

        // Initialize the pause menu (add it to the DOM)
        menu.init(document.querySelector(".game-container"));
    }

    // Starts the add story flag event for the overworld (add to player's state - story progress)
    addStoryFlag(resolve) {
        window.playerState.storyFlags[this.event.flag] = true;
        resolve();
    }

    // Starts the crafting menu event for the overworld (give player new Pizza with the Pizza Stone)
    craftingMenu(resolve) {
        // Create the crafting menu
        const menu = new CraftingMenu({
            pizzas: this.event.pizzas,
            onComplete: () => {
                resolve();
            }
        })

        // Initialize the crafting menu (add it to the DOM)
        menu.init(document.querySelector(".game-container"))
    }

    // Method to call the behavior methods
    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }
}