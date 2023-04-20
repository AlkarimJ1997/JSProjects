class BattleEvent {
    constructor(event, battle) {
        this.event = event;
        this.battle = battle;
    }

    // Start the text message event for the battle
    textMessage(resolve) {
        // Replace event text with dynamic attributes (caster, target, etc)
        const text = this.event.text
            .replace("{CASTER}", this.event.caster?.name)
            .replace("{TARGET}", this.event.target?.name)
            .replace("{ACTION}", this.event.action?.name)

        const message = new TextMessage({
            text,
            onComplete: () => {
                resolve();
            }
        });

        message.init(this.battle.element);
    }

    // Start the state change event for the battle (change HP, XP, etc.)
    async stateChange(resolve) {
        const { caster, target, damage, recover, status } = this.event;

        // Check who should receive the state change
        let who = this.event.onCaster ? caster : target;

        // Change the target's HP based on the damage of the event/action (if any)
        if (damage) {
            // Modify the target's HP
            target.update({
                hp: target.hp - damage
            })

            // Make the recipient of the damage start blinking
            target.pizzaElement.classList.add("battle-damage-blink");
        }

        // Recover the caster/target's HP if their is a recover value
        if (recover) {
            // Recover their HP (or set to max)
            let newHp = who.hp + recover;
            if (newHp > who.maxHp) {
                newHp = who.maxHp;
            }

            who.update({
                hp: newHp
            })
        }

        // Apply a status change to the target if there is a new status
        if (status) {
            who.update({
                status: { ...status }
            })
        }

        // If there is no longer a status, remove the status
        if (status === null) {
            who.update({
                status: null
            })
        }

        // Wait for the blinking animation
        await utils.wait(600)

        // Update the Team components
        this.battle.playerTeam.update();
        this.battle.enemyTeam.update();

        // Stop the blinking animation
        target.pizzaElement.classList.remove("battle-damage-blink");

        // Resolve the event
        resolve();
    }

    // Start the submission menu event for the battle (put the menu on screen)
    submissionMenu(resolve) {
        const { caster } = this.event;

        const menu = new SubmissionMenu({
            caster: caster,
            enemy: this.event.enemy,
            items: this.battle.items,
            replacements: Object.values(this.battle.combatants).filter(c => {
                return c.id !== caster.id && c.team === caster.team && c.hp > 0;
            }),
            onComplete: submission => {
                // What move to use and who to use it on
                resolve(submission);
            }
        })

        menu.init(this.battle.element)
    }

    // Start the replacement menu event for the battle (put the menu on screen)
    replacementMenu(resolve) {
        const menu = new ReplacementMenu({
            replacements: Object.values(this.battle.combatants).filter(c => {
                return c.team === this.event.team && c.hp > 0;
            }),
            onComplete: replacement => {
                resolve(replacement);
            }
        })

        menu.init(this.battle.element)
    }

    // Start the replacement event for the battle (swap the current Pizza)
    async replace(resolve) {
        const { replacement } = this.event;

        // Get the previous combatant (one being swapped out)
        const prevCombatant = this.battle.combatants[this.battle.activeCombatants[replacement.team]];

        // Clear out the previous Combatant from the list of active Combatants and remove him from the DOM
        this.battle.activeCombatants[replacement.team] = null;
        prevCombatant.update();
        await utils.wait(400);

        // Add the new, replacement Combatant to the list of active Combatants and add him to the DOM
        this.battle.activeCombatants[replacement.team] = replacement.id;
        replacement.update();
        await utils.wait(400);

        // Update the Team components
        this.battle.playerTeam.update();
        this.battle.enemyTeam.update();

        // Resolve the event (to continue the battle cycle)
        resolve();
    }

    // Start the XP gain event for the battle (give XP to the active Pizza)
    giveXp(resolve) {
        // How much XP to give, and active Pizza
        let amount = this.event.xp;
        const { combatant } = this.event;

        // Step function that runs every frame (upticks the Combatant's XP and downticks remaining XP to give)
        const step = () => {
            if (amount > 0) {
                amount--;
                combatant.xp++;

                // If Pizza has hit the level up threshold, uptick the Pizza's level and reset their XP
                if (combatant.xp === combatant.maxXp) {
                    combatant.xp = 0;
                    combatant.maxXp = 100;
                    combatant.level++;
                }

                // Update the Pizza (health bar, etc.), then run the step function again
                combatant.update();
                requestAnimationFrame(step);
                return;
            }

            // All XP has been rewarded, resolve the event
            resolve();
        }
        requestAnimationFrame(step);
    }

    // Start the animation event for the battle
    animation(resolve) {
        const fn = BattleAnimations[this.event.animation];

        fn(this.event, resolve);
    }

    // Method to call the behavior methods
    init(resolve) {
        this[this.event.type](resolve);
    }
}