class CraftingMenu {
    constructor({ pizzas, onComplete }) {
        this.pizzas = pizzas;
        this.onComplete = onComplete;
    }

    // Method to update the Crafting Menu (show the options)
    getOptions() {
        return this.pizzas.map(id => {
            const baseConfig = Pizzas[id];

            return {
                label: baseConfig.name,
                description: baseConfig.description,
                handler: () => {
                    // Add a Pizza to the player's state
                    playerState.addPizza(id);

                    // Close the Crafting menu
                    this.close();
                }
            }
        })
    }

    // Method to create an element for the Crafting Menu
    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('CraftingMenu');
        this.element.classList.add('overlayMenu');
        this.element.innerHTML = (`
            <h2>Create a Pizza</h2>
        `)
    }

    // Method to close the Crafting menu (clean up events, unbind key presses, remove DOM manipulation)
    close() {
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    // Method to append the Crafting Menu element to the DOM
    async init(container) {
        this.createElement();

        // Create a keyboard menu for the Crafting Menu
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        });
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions());

        // Append the Crafting menu to the DOM
        container.appendChild(this.element);
    }
}