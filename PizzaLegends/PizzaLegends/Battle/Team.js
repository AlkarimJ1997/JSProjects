class Team {
    constructor(team, name) {
        // Team -> player or enemy, name is the name of the enemy
        this.team = team;
        this.name = name;

        // All pizzas on the team
        this.combatants = [];
    }

    // Method to create a Team element for the battle
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Team");
        this.element.setAttribute("data-team", this.team);

        // Create an icon for each combatant on the team
        this.combatants.forEach(combatant => {
            let icon = document.createElement("div");

            icon.setAttribute("data-combatant", combatant.id);
            icon.innerHTML = (`
                <svg xmlns="http://www.w3.org/2000/svg" width="14" viewBox="0 -0.5 7 10" shape-rendering="crispEdges">
                    <path stroke="#3a160d" d="M2 0h3M1 1h1M5 1h1M0 2h1M6 2h1M0 3h1M6 3h1M0 4h1M6 4h1M1 5h1M5 5h1M2 6h3" />
                    <path stroke="#e2b051" d="M2 1h1M4 1h1M1 2h1M5 2h1M1 4h1M5 4h1M2 5h1M4 5h1" />
                    <path stroke="#ffd986" d="M3 1h1M2 2h3M1 3h5M2 4h3M3 5h1" />
            
                    <!-- Active indicator appears when needed with CSS -->
                    <path class="active-pizza-indicator" stroke="#3a160d" d="M3 8h1M2 9h3" />

                    <!-- Dead paths appear when needed with CSS -->
                    <path class="dead-pizza" stroke="#3a160d" d="M2 0h3M1 1h1M5 1h1M0 2h1M2 2h1M4 2h1M6 2h1M0 3h1M3 3h1M6 3h1M0 4h1M2 4h1M4 4h1M6 4h1M1 5h1M5 5h1M2 6h3" />
                    <path class="dead-pizza" stroke="#9b917f" d="M2 1h3M1 2h1M5 2h1" />
                    <path class="dead-pizza" stroke="#c4bdae" d="M3 2h1M1 3h2M4 3h2M1 4h1M3 4h1M5 4h1M2 5h3" />
                </svg> 
            `);

            // Append the icon to the Team element
            this.element.appendChild(icon);
        })
    }

    // Method to update dynamic attributes of Team - fill into the DOM
    update() {
        this.combatants.forEach(combatant => {
            const icon = this.element.querySelector(`[data-combatant="${combatant.id}"]`);

            // Update the icon to the dead or active icon depending on if the combatant is dead or active
            icon.setAttribute("data-dead", combatant.hp <= 0);
            icon.setAttribute("data-active", combatant.isActive);
        })
    }

    // Method to append the Team (HUD) element to the DOM
    init(container) {
        this.createElement();
        this.update();
        container.appendChild(this.element);
    }
}