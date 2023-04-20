class Battle {
    constructor({ enemy, onComplete, arena }) {
        this.enemy = enemy;
        this.onComplete = onComplete;
        this.arena = arena;

        this.combatants = {
            // "player1": new Combatant({
            //   ...Pizzas.s001,
            //   team: "player",
            //   hp: 30,
            //   maxHp: 50,
            //   xp: 95,
            //   maxXp: 100,
            //   level: 1,
            //   status: { type: "saucy" },
            //   isPlayerControlled: true
            // }, this),
            // "player2": new Combatant({
            //   ...Pizzas.s002,
            //   team: "player",
            //   hp: 30,
            //   maxHp: 50,
            //   xp: 75,
            //   maxXp: 100,
            //   level: 1,
            //   status: null,
            //   isPlayerControlled: true
            // }, this),
            // "enemy1": new Combatant({
            //   ...Pizzas.v001,
            //   team: "enemy",
            //   hp: 1,
            //   maxHp: 50,
            //   xp: 20,
            //   maxXp: 100,
            //   level: 1,
            // }, this),
            // "enemy2": new Combatant({
            //   ...Pizzas.f001,
            //   team: "enemy",
            //   hp: 25,
            //   maxHp: 50,
            //   xp: 30,
            //   maxXp: 100,
            //   level: 1,
            // }, this)
        }

        // Active combatants
        this.activeCombatants = { player: null, enemy: null };

        // Add all of the player's combatants (pizzas) to the battle
        window.playerState.lineup.forEach(id => {
            this.addCombatant(id, "player", window.playerState.pizzas[id]);
        });

        // Add all of the enemy's combatants (pizzas) to the battle
        Object.keys(this.enemy.pizzas).forEach(key => {
            this.addCombatant(`e_${key}`, "enemy", this.enemy.pizzas[key])
        })

        // Add all of the player's items to the battle (initially empty)
        this.items = []

        window.playerState.items.forEach(item => {
            this.items.push({
                ...item,
                team: "player"
            })
        })

        // Items that the player used in the battle (dynamically updated during turn cycle)
        this.usedInstanceIds = {};
    }

    // Method to add Combatant to the battle dynamically
    addCombatant(id, team, config) {
        this.combatants[id] = new Combatant({
            ...Pizzas[config.pizzaId],
            ...config,
            team,
            isPlayerControlled: team === "player"
        }, this)

        // Populate the first active Pizza (set first Combatant to active)
        this.activeCombatants[team] = this.activeCombatants[team] || id
    }

    // Method to create an element for the battle
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Battle");

        // If an arena is provided, add a CSS class for setting the arena background
        if (this.arena) this.element.classList.add(this.arena);

        this.element.innerHTML = (`
                <div class="Battle_hero">
                    <img src="${'/images/characters/people/hero.png'}" alt="Hero" />
                </div>
                <div class="Battle_enemy">
                    <img src=${this.enemy.src} alt=${this.enemy.name} />
                </div>
            `
        );
    }

    // Method to append the Battle (scene) to the DOM
    init(container) {
        this.createElement();
        container.appendChild(this.element);

        // Team components for the battle
        this.playerTeam = new Team("player", "Hero");
        this.enemyTeam = new Team("enemy", "Bully");

        // Appending the combatants to the battle
        Object.keys(this.combatants).forEach(key => {
            let combatant = this.combatants[key];
            combatant.id = key;

            combatant.init(this.element)

            // Add each combatant to their team
            if (combatant.team === "player") {
                this.playerTeam.combatants.push(combatant);
            } else if (combatant.team === "enemy") {
                this.enemyTeam.combatants.push(combatant);
            }
        });

        // Initialize Team components (to add them to the battle scene)
        this.playerTeam.init(this.element);
        this.enemyTeam.init(this.element);

        // Start the turn cycle for the battle
        this.turnCycle = new TurnCycle({
            battle: this,
            onNewEvent: event => {
                return new Promise(resolve => {
                    const battleEvent = new BattleEvent(event, this);
                    battleEvent.init(resolve);
                })
            },
            onWinner: winner => {
                // Persist the results of the battle to the player's state
                if (winner === "player") {
                    const playerState = window.playerState;

                    Object.keys(playerState.pizzas).forEach(id => {
                        // Get a reference to the player state pizza and the battle pizza
                        const playerStatePizza = playerState.pizzas[id];
                        const combatant = this.combatants[id];

                        // Update the player state pizza with the battle pizza's
                        // config (xp gain, hp remaining, etc.)
                        if (combatant) {
                            playerStatePizza.hp = combatant.hp;
                            playerStatePizza.xp = combatant.xp;
                            playerStatePizza.maxXp = combatant.maxXp;
                            playerStatePizza.level = combatant.level;
                        }
                    })

                    // Update the player state's inventory with the items used in the battle (remove)
                    playerState.items = playerState.items.filter(item => {
                        return !this.usedInstanceIds[item.instanceId]
                    })

                    // Fire off signal that player state has changed (to update the overworld HUD)
                    utils.emitEvent("PlayerStateUpdated");
                }

                // Remove the battle scene from the DOM and complete the battle
                this.element.remove();
                this.onComplete(winner === "player");
            }
        });

        this.turnCycle.init();
    }
}