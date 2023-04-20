class Combatant {
    constructor(config, battle) {
        // config contains the data for the Combatant (HP, Max HP, XP, Name, actions they can do, etc.)
        Object.keys(config).forEach(key => {
            // hp: 10 -> this.hp = 10;
            this[key] = config[key];
        })

        // If no HP is given, default to max
        this.hp = typeof (this.hp) === "undefined" ? this.maxHp : this.hp;

        this.battle = battle;
    }

    // Getter method for the percentage of HP of the Combatant (0 if HP is negative)
    get hpPercent() {
        const percent = this.hp / this.maxHp * 100;

        return percent > 0 ? percent : 0;
    }

    // Getter method for the percentage of XP of the Combatant
    get xpPercent() {
        return this.xp / this.maxXp * 100;
    }

    // Getter method for checking if the combatant is active
    get isActive() {
        return this.battle?.activeCombatants[this.team] === this.id;
    }

    // Getter method for how much XP should be rewarded to the Combatant
    get givesXp() {
        return this.level * 20;
    }

    // Method to create an element for the Combatant
    createElement() {
        // Creating the HUD element
        this.hudElement = document.createElement("div");
        this.hudElement.classList.add("Combatant");
        this.hudElement.setAttribute("data-combatant", this.id);
        this.hudElement.setAttribute("data-team", this.team);

        this.hudElement.innerHTML = (`
                <p class="Combatant_name">${this.name}</p>
                <p class="Combatant_level"></p>
                <div class="Combatant_character_crop">
                    <img class="Combatant_character" alt="${this.name}" src="${this.src}" />
                </div>
                <img class="Combatant_type" src="${this.icon}" alt="${this.type}" />
                <svg viewBox="0 0 26 3" class="Combatant_life-container">
                    <rect x=0 y=0 width="0%" height=1 fill="#82ff71" />
                    <rect x=0 y=1 width="0%" height=2 fill="#3ef126" />
                </svg>
                <svg viewBox="0 0 26 2" class="Combatant_xp-container">
                    <rect x=0 y=0 width="0%" height=1 fill="#ffd76a" />
                    <rect x=0 y=1 width="0%" height=1 fill="#ffc934" />
                </svg>
                <p class="Combatant_status"></p>
            `
        );

        // Creating the Pizza element (with a data attribute for positioning purposes)
        this.pizzaElement = document.createElement("img");
        this.pizzaElement.classList.add("Pizza");
        this.pizzaElement.setAttribute("src", this.src);
        this.pizzaElement.setAttribute("alt", this.name);
        this.pizzaElement.setAttribute("data-team", this.team);

        // References to the HP and XP bars
        this.hpFills = this.hudElement.querySelectorAll(".Combatant_life-container > rect");
        this.xpFills = this.hudElement.querySelectorAll(".Combatant_xp-container > rect");
    }

    // Method to update dynamic attributes of Combatant (HP, XP, etc.) - fill into the DOM
    update(changes = {}) {
        Object.keys(changes).forEach(key => {
            this[key] = changes[key];
        });

        // Add data-active attributes to the Combatant and Pizza (true if active, else false)
        this.hudElement.setAttribute("data-active", this.isActive);
        this.pizzaElement.setAttribute("data-active", this.isActive);

        // Update the HP and XP bars in the DOM
        this.hpFills.forEach(rect => rect.style.width = `${this.hpPercent}%`)
        this.xpFills.forEach(rect => rect.style.width = `${this.xpPercent}%`)

        // Update the level of the Pizza in the DOM
        this.hudElement.querySelector(".Combatant_level").innerText = this.level;

        //Update the status in the DOM (if a status exists), otherwise remove it
        const statusElement = this.hudElement.querySelector(".Combatant_status");

        if (this.status) {
            statusElement.innerText = this.status.type;
            statusElement.style.display = "block";
        } else {
            statusElement.innerText = "";
            statusElement.style.display = "none";
        }
    }

    // Method to get replaced events of a Combatant, returning the original events if nothing to replace
    getReplacedEvents(originalEvents) {
        // If the Combatant has a clumsy status, possibly replace
        // original events with a clumsy event (33% chance)
        if (this.status?.type === "clumsy" && utils.randomFromArray([true, false, false])) {
            return [
                { type: "textMessage", text: `${this.name} flops over!` },
            ]
        }

        return originalEvents;
    }

    // Method to get the post events (ones to happen after submission) of a Combatant
    getPostEvents() {
        // Get the saucy status events
        if (this.status?.type === "saucy") {
            return [
                { type: "textMessage", text: "Feelin' saucy!" },
                { type: "stateChange", recover: 5, onCaster: true }
            ]
        }
        return [];
    }

    // Method to decrement the status change's expiry (how much time is left)
    decrementStatus() {
        if (this.status?.expiresIn > 0) {
            this.status.expiresIn--;

            // Check if the status change has expired
            if (this.status.expiresIn === 0) {
                // Capitalize the type of status and make an expire message
                const expireMessage = utils.capitalize(this.status.type);

                // Remove the status from the Combatant
                this.update({
                    status: null
                })
                return {
                    type: "textMessage",
                    text: `${expireMessage} has expired!`
                }
            }
        }
        return null;
    }

    // Method to append the Combatant HUD and pizza to the DOM (including updates)
    init(container) {
        this.createElement();
        container.appendChild(this.hudElement);
        container.appendChild(this.pizzaElement);

        this.update();
    }
}