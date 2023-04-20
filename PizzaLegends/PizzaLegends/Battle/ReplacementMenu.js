class ReplacementMenu {
    constructor({ replacements, onComplete }) {
        this.replacements = replacements;
        this.onComplete = onComplete;
    }

    // Method to decide what random replacement the enemy should swap to during the battle (Enemy AI logic)
    decide() {
        this.menuSubmit(this.replacements[0])
    }

    // Method to submit the replacement from the keyboard menu to the battle
    menuSubmit(replacement) {
        // End the keyboard menu and its related elements/events before submitting the action
        this.keyboardMenu?.end();

        this.onComplete(replacement);
    }

    // Method that creates the replacement menu and appends it to the DOM (shows it)
    showMenu(container) {
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(container);
        this.keyboardMenu.setOptions(this.replacements.map(replacement => {
            return {
                label: replacement.name,
                description: replacement.description,
                handler: () => {
                    // Swap me in, coach!
                    this.menuSubmit(replacement);
                }
            }
        }))
    }

    // Method to append the replacement menu to the DOM
    init(container) {
        // If the caster is player controlled, show the replacement menu
        if (this.replacements[0].isPlayerControlled) {
            this.showMenu(container);
        } else {
            // Otherwise, just decide what replacement to swap to at random
            this.decide();
        }
    }
}