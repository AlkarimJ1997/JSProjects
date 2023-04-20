class Person extends GameObject {
    constructor(config) {
        // Call the super constructor
        super(config);

        // Stores how much the person has left to move
        this.movingProgressRemaining = 0;

        // Stores if the person is currently standing
        this.isStanding = false;

        // Flag for if the person is an NPC or the actual player
        this.isPlayerControlled = config.isPlayerControlled || false;

        // Flag for if the person is currently retrying their behavior (walk)
        this.retrying = false;

        this.directionUpdate = {
            "up": ["y", -1],
            "down": ["y", 1],
            "left": ["x", -1],
            "right": ["x", 1]
        }
    }

    update(state) {
        if (this.movingProgressRemaining > 0) {
            this.updatePosition();
        } else {
            // Case: keyboard ready and arrow is pressed
            if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
                this.startBehavior(state, {
                    type: "walk",
                    direction: state.arrow
                })
            }
            this.updateSprite(state);
        }
    }

    // Starts the walking behavior of the person
    startBehavior(state, behavior) {
        this.direction = behavior.direction || this.direction;

        // If the person is already walking, don't start again
        this.retrying = false;

        if (behavior.type === "walk") {
            // If space is taken, check for retry, else do nothing
            if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {

                // If the retry flag is set, start retrying the behavior
                // Note: isRetrying is needed to prevent behavior bugs on ends of cutscenes
                if (behavior.retry) {
                    this.retrying = true;
                    setTimeout(() => {
                        this.startBehavior(state, behavior);
                    }, 10)
                }

                return;
            }

            // Actually move the person (walk)
            state.map.moveWall(this.x, this.y, this.direction);
            this.movingProgressRemaining = 16;
            this.updateSprite(state);
        }

        if (behavior.type === "stand") {
            // Set the person to be standing
            this.isStanding = true;

            setTimeout(() => {
                utils.emitEvent("PersonStandComplete", { whoId: this.id });
                this.isStanding = false;
            }, behavior.time)
        }
    }

    updatePosition() {
        // Array destructuring (property = "x or y", change = -1 or 1)
        const [property, change] = this.directionUpdate[this.direction];

        this[property] += change;
        this.movingProgressRemaining--;

        // If the person has finished moving, emit a custom event
        if (this.movingProgressRemaining === 0) {
            utils.emitEvent("PersonWalkingComplete", { whoId: this.id });
        }
    }

    // Method to update the sprite's animation based on the state of the person
    updateSprite() {
        if (this.movingProgressRemaining > 0) {
            this.sprite.setAnimation("walk-" + this.direction);
            return;
        }

        this.sprite.setAnimation("idle-" + this.direction);
    }
}