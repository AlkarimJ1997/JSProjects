class Hud {
    constructor() {
        // List of scoreboards (info for each Pizza)
        this.scoreboards = [];
    }

    // Method to update dynamic attributes of HUD (scoreboard) - fill into the DOM
    update() {
        this.scoreboards.forEach(scoreboard => {
            // Update each scoreboard with its current values (from player state)
            scoreboard.update(window.playerState.pizzas[scoreboard.id]);
        })
    }

    // Method to create an element for the HUD
    createElement() {
        // Remove any existing elements from the HUD (if they exist) and reset scoreboards
        this.element?.remove();
        this.scoreboards = [];

        // Create new HUD element
        this.element = document.createElement("div");
        this.element.classList.add("Hud");

        // Add a component to the HUD for each Pizza in the player's lineup
        const { playerState } = window;

        playerState.lineup.forEach(key => {
            // Create scoreboard for each Pizza
            const pizza = playerState.pizzas[key];
            const scoreboard = new Combatant({
                id: key,
                ...Pizzas[pizza.pizzaId],
                ...pizza,
            }, null)

            // Add scoreboard to the HUD
            scoreboard.createElement();
            this.scoreboards.push(scoreboard);

            // Append scoreboard to the Hud's DOM
            this.element.appendChild(scoreboard.hudElement);
        })

        // Update all scoreboards to have their current values
        this.update();
    }

    // Method to append the HUD to the DOM
    init(container) {
        this.createElement();
        container.appendChild(this.element);

        // Listen for signals that player state has changed and update the HUD accordingly
        document.addEventListener("PlayerStateUpdated", () => {
            this.update();
        })

        document.addEventListener("LineupChanged", () => {
            // Refresh all pizzas in the HUD
            this.createElement();
            container.appendChild(this.element);
        })
    }
}