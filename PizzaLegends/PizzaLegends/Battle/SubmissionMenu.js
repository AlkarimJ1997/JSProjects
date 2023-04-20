class SubmissionMenu {
    constructor({ caster, enemy, onComplete, items, replacements }) {
        this.caster = caster;
        this.enemy = enemy;
        this.replacements = replacements;
        this.onComplete = onComplete;

        // Quantity map for items
        let quantityMap = {};

        items.forEach(item => {
            // Check if the item belongs to the player
            if (item.team === caster.team) {
                // If the item is already an existing item, increase the quantity
                let existing = quantityMap[item.actionId];

                if (existing) {
                    existing.quantity++;
                    return;
                }

                // Otherwise, add a reference to the item in the quantity map
                quantityMap[item.actionId] = {
                    actionId: item.actionId,
                    quantity: 1,
                    instanceId: item.instanceId,
                }
            }
        })

        // Assign the items for the submission menu using the quantity map
        this.items = Object.values(quantityMap);
    }

    getPages() {
        // Create a static go back option for the keyboard menu pages
        const backOption = {
            label: "Go Back",
            description: "Return to previous page",
            handler: () => {
                // Changes the options of the keyboard menu back to the root
                this.keyboardMenu.setOptions(this.getPages().root)
            }
        };

        return {
            root: [
                {
                    label: "Attack",
                    description: "Choose an attack",
                    handler: () => {
                        // Change the options of the keyboard menu to the caster's attacks
                        this.keyboardMenu.setOptions(this.getPages().attacks)
                    }
                },
                {
                    label: "Items",
                    description: "Choose an item",
                    handler: () => {
                        // Change the options of the keyboard menu to the caster's items
                        this.keyboardMenu.setOptions(this.getPages().items)
                    }
                },
                {
                    label: "Swap",
                    description: "Change to another pizza",
                    handler: () => {
                        // Change the options of the keyboard menu to the caster's other Pizzas
                        this.keyboardMenu.setOptions(this.getPages().replacements)
                    }
                },
            ],
            attacks: [
                ...this.caster.actions.map(key => {
                    // Get the action object
                    const action = Actions[key];

                    return {
                        label: action.name,
                        description: action.description,
                        handler: () => {
                            this.menuSubmit(action);
                        }
                    }
                }),
                backOption
            ],
            items: [
                ...this.items.map(item => {
                    // Get the item object
                    const action = Actions[item.actionId];

                    return {
                        label: action.name,
                        description: action.description,
                        right: () => {
                            return `x${item.quantity}`;
                        },
                        handler: () => {
                            this.menuSubmit(action, item.instanceId);
                        }
                    }
                }),
                backOption
            ],
            replacements: [
                ...this.replacements.map(replacement => {
                    return {
                        label: replacement.name,
                        description: replacement.description,
                        handler: () => {
                            //Swap me in, coach!
                            this.menuSubmitReplacement(replacement);
                        }
                    }
                }),
                backOption
            ]
        }
    }

    // Method to submit the swap action from the keyboard menu
    menuSubmitReplacement(replacement) {
        // End the keyboard menu and its related elements/events before submitting the action
        this.keyboardMenu?.end();

        // Swap me in, coach!
        this.onComplete({ replacement })
    }

    // Method to submit the action from the keyboard menu to the battle
    menuSubmit(action, instanceId = null) {
        // End the keyboard menu and its related elements/events before submitting the action
        this.keyboardMenu?.end();

        this.onComplete({
            action,
            target: action.targetType === "friendly" ? this.caster : this.enemy,
            instanceId
        })
    }

    // Method to decide what random action for the enemy to use during the battle (enemy AI logic)
    decide() {
        this.menuSubmit(Actions[this.caster.actions[0]]);
    }

    // Method that creates the submission menu and appends it to the DOM (shows it)
    showMenu(container) {
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(container);
        this.keyboardMenu.setOptions(this.getPages().root);
    }

    // Method to append the submission menu to the DOM
    init(container) {
        // If the caster is player controlled, show the submission menu
        if (this.caster.isPlayerControlled) {
            this.showMenu(container);
        } else {
            // Otherwise, just decide what action to use at random
            this.decide();
        }
    }
}