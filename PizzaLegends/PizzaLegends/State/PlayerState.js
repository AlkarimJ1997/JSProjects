class PlayerState {
    constructor() {
        this.pizzas = {
            "p1": {
                pizzaId: "s001",
                hp: 50,
                maxHp: 50,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null
            },
            // "p2": {
            //     pizzaId: "v001",
            //     hp: 50,
            //     maxHp: 50,
            //     xp: 75,
            //     maxXp: 100,
            //     level: 1,
            //     status: null,
            // },
            // "p3": {
            //     pizzaId: "f001",
            //     hp: 50,
            //     maxHp: 50,
            //     xp: 75,
            //     maxXp: 100,
            //     level: 1,
            //     status: null,
            // }
        }

        // Lineup for order of Pizzas in player's party
        this.lineup = ["p1"];

        // State of inventory (items in player's inventory)
        this.items = [
            { actionId: "item_recoverHp", instanceId: "item1" },
            { actionId: "item_recoverHp", instanceId: "item2" },
            { actionId: "item_recoverHp", instanceId: "item3" },
            { actionId: "item_recoverStatus", instanceId: "item4" }
        ]

        // Flags for story progress (initially empty)
        this.storyFlags = {};
    }

    // Method to add a Pizza to the player's party (state)
    addPizza(pizzaId) {
        // Note: newId is a random string to act as a unique key for the pizza,
        // like the others in player state (i.e. p1, p2, etc.)
        const newId = `p${Date.now()}` + Math.floor(Math.random() * 99999);

        this.pizzas[newId] = {
            pizzaId,
            hp: 50,
            maxHp: 50,
            xp: 0,
            maxXp: 100,
            level: 1,
            status: null,
        }

        // If the player's lineup has room, add the new pizza to the lineup
        if (this.lineup.length < 3) this.lineup.push(newId);

        // Update the HUD (since player state has changed)
        utils.emitEvent("LineupChanged");
    }

    // Method to swap a pizza in the lineup with another that isn't in the lineup
    swapLineup(oldId, incomingId) {
        // Get reference to old pizza and swap it with the incoming pizza
        const oldIndex = this.lineup.indexOf(oldId);
        this.lineup[oldIndex] = incomingId;

        // Update the HUD (since player state has changed)
        utils.emitEvent("LineupChanged");
    }

    // Method to move a pizza to the front of the lineup
    moveToFront(incomingFrontId) {
        // Remove incoming pizza from the lineup and then add it to the front
        this.lineup = this.lineup.filter(id => id !== incomingFrontId);
        this.lineup.unshift(incomingFrontId);

        // Update the HUD (since player state has changed)
        utils.emitEvent("LineupChanged");
    }
}

window.playerState = new PlayerState();