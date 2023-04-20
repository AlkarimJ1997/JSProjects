class PauseMenu {
    constructor({ hero, progress, onComplete }) {
        // Hero is a dependency to resume the game in the exact spot the player saved it at
        this.hero = hero;
        this.progress = progress;
        this.onComplete = onComplete;
    }

    // Method to update the pause menu (get different options)
    getOptions(pageKey) {
        // Case 1: Show the main options of the pause menu
        if (pageKey === "root") {
            // Get the player's pizza lineup
            const lineupPizzas = playerState.lineup.map(id => {
                // Get the pizza ID using the lineup ID and then get the pizza's configuration
                const { pizzaId } = playerState.pizzas[id];
                const baseConfig = Pizzas[pizzaId];

                return {
                    label: baseConfig.name,
                    description: baseConfig.description,
                    handler: () => {
                        // Update the pause menu to show the selected pizza's stats
                        this.keyboardMenu.setOptions(this.getOptions(id));
                    }
                }
            })

            return [
                // All of our player's pizzas (dynamically)
                ...lineupPizzas,
                {
                    label: "Save",
                    description: "Save your progress",
                    handler: () => {
                        // Save the player's progress (and current position)
                        // this.progress.startingHeroX = this.hero.x;
                        // this.progress.startingHeroY = this.hero.y;
                        // this.progress.startingHeroDirection = this.hero.direction;
                        this.progress.save();

                        // Close the pause menu
                        this.close();
                    }
                },
                {
                    label: "Close",
                    description: "Close the pause menu",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        }

        // Case 2: Show the options for just one pizza (stats)

        // Get all unequipped pizzas (ones that are not in the player's lineup)
        const unequippedPizzas = Object.keys(playerState.pizzas).filter(id => {
            return !playerState.lineup.includes(id);
        }).map(id => {
            // Get the pizza ID using the unequipped ID and then get the pizza's configuration
            const { pizzaId } = playerState.pizzas[id];
            const baseConfig = Pizzas[pizzaId];

            return {
                label: `Swap for ${baseConfig.name}`,
                description: baseConfig.description,
                handler: () => {
                    // Swap the selected pizza for the current one (update player state) and return to root
                    playerState.swapLineup(pageKey, id);
                    this.keyboardMenu.setOptions(this.getOptions("root"));
                }
            }
        })

        return [
            // Swap options for any unequipped pizza (one that isn't in the lineup) dynamically
            ...unequippedPizzas,
            {
                label: "Move to front",
                description: "Move this pizza to the front of your lineup",
                handler: () => {
                    // Move the pizza to the front of the lineup and return to root
                    playerState.moveToFront(pageKey);
                    this.keyboardMenu.setOptions(this.getOptions("root"));
                }
            },
            {
                label: "Back",
                description: "Back to root menu",
                handler: () => {
                    // Update the pause menu to show the main options
                    this.keyboardMenu.setOptions(this.getOptions("root"));
                }
            }
        ]
    }

    // Method to create an element for the pause menu
    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('PauseMenu');
        this.element.classList.add('overlayMenu');
        this.element.innerHTML = (`
            <h2>Pause Menu</h2>
        `)
    }

    // Method to close the pause menu (clean up events, unbind key presses, remove DOM manipulation)
    close() {
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    // Method to append the pause menu element to the DOM
    async init(container) {
        this.createElement();

        // Create a keyboard menu for the pause menu
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        });
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        // Append the pause menu to the DOM
        container.appendChild(this.element);

        // Add key event listener to close the pause menu
        utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
            this.close();
        })
    }
}