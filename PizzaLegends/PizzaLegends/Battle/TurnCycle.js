class TurnCycle {
    constructor({ battle, onNewEvent, onWinner }) {
        this.battle = battle;
        this.onNewEvent = onNewEvent;
        this.onWinner = onWinner;

        // Tracks whose turn it is ("player" or "enemy")
        this.currentTeam = "player";
    }

    // Method to asyncronously run the turn cycle
    async turn() {
        //Get the caster of the current turn
        const casterId = this.battle.activeCombatants[this.currentTeam];
        const caster = this.battle.combatants[casterId];

        // Get the enemy of the current turn
        const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"]
        const enemy = this.battle.combatants[enemyId];

        // What action does the caster want to use
        const submission = await this.onNewEvent({
            type: "submissionMenu",
            caster,
            enemy
        })

        // Stop here if a swapping action was chosen (i.e. replace the current pizza)
        if (submission.replacement) {
            await this.onNewEvent({
                type: "replace",
                replacement: submission.replacement
            })

            // Submit an introductory message event on swap out
            await this.onNewEvent({
                type: "textMessage",
                text: `Go get 'em, ${submission.replacement.name}!`
            })

            // End the turn, switch teams and begin the next turn
            this.nextTurn();
            return;
        }

        // Check if the submission had an instanceId (meaning it was an item)
        if (submission.instanceId) {
            // Add to list of used items for persistence purposes
            this.battle.usedInstanceIds[submission.instanceId] = true;

            // Remove the used item from the inventory
            this.battle.items = this.battle.items.filter(i => i.instanceId !== submission.instanceId)
        }

        // Get the resulting events from the submission (could be success or failure - missing, etc.)
        const resultingEvents = caster.getReplacedEvents(submission.action.success);

        for (let i = 0; i < resultingEvents.length; i++) {
            // Merge data onto each event
            const event = {
                ...resultingEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }

            // Await the event
            await this.onNewEvent(event);
        }

        // Did the target die?
        const targetDead = submission.target.hp <= 0;

        if (targetDead) {
            // Submit a message event on death
            await this.onNewEvent({
                type: "textMessage", text: `${submission.target.name} is ruined!`
            })

            // Reward XP to the active Pizza if the dead target was an enemy Pizza
            if (submission.target.team === "enemy") {
                // Get active Pizza and XP to give
                const playerActivePizzaId = this.battle.activeCombatants.player;
                const xp = submission.target.givesXp;

                // Submit a message event to tell the user how much XP they gained
                await this.onNewEvent({
                    type: "textMessage",
                    text: `${this.battle.combatants[playerActivePizzaId].name} gained ${xp} XP!`
                })

                await this.onNewEvent({
                    type: "giveXp",
                    xp,
                    combatant: this.battle.combatants[playerActivePizzaId]
                })
            }
        }

        // Do we have a winning team? (no replacements left) If so, end the battle
        const winner = this.getWinningTeam();

        if (winner) {
            // Display a victory message
            await this.onNewEvent({
                type: "textMessage",
                text: "Winner!"
            })

            // End the battle
            this.onWinner(winner);
            return;
        }

        // Are there any replacements left on said team? If so, replace the dead one with a new one
        if (targetDead) {
            // Find a replacement for the dead target (if any)
            const replacement = await this.onNewEvent({
                type: "replacementMenu",
                team: submission.target.team
            })

            // Swap to the replacement and display a message
            await this.onNewEvent({
                type: "replace",
                replacement: replacement
            })

            await this.onNewEvent({
                type: "textMessage",
                text: `${replacement.name} appears!`
            })
        }


        // Check for post events (e.g. status changes)
        const postEvents = caster.getPostEvents();

        for (let i = 0; i < postEvents.length; i++) {
            // Merge data onto each event
            const event = {
                ...postEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }

            // Await the event
            await this.onNewEvent(event);
        }

        // Check if any status changes have expired
        const expiredEvent = caster.decrementStatus();

        if (expiredEvent) await this.onNewEvent(expiredEvent);

        // Turn has completed, switch teams and begin the next turn
        this.nextTurn();
    }

    // Method to complete the turn, switch teams and begin the next turn
    nextTurn() {
        this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
        this.turn();
    }

    // Method to get the winning team (if any)
    getWinningTeam() {
        let aliveTeams = {};

        // Check through all teams
        Object.values(this.battle.combatants).forEach(combatant => {
            if (combatant.hp > 0) {
                aliveTeams[combatant.team] = true;
            }
        });

        // Check the alive teams to see if there is a winner
        if (!aliveTeams["player"]) return "enemy";
        if (!aliveTeams["enemy"]) return "player";

        return null;
    }

    // Method to launch event for the turn cycle
    async init() {
        await this.onNewEvent({
            type: "textMessage",
            text: `${this.battle.enemy.name} wants to throw down!`
        })

        // Start the first turn
        this.turn();
    }
}