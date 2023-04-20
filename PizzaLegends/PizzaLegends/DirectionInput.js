class DirectionInput {
    constructor() {
        // Stores the keys that are currently pressed
        this.heldDirections = [];

        // Dictionary of key codes to direction names
        this.map = {
            "ArrowUp": "up",
            "KeyW": "up",
            "ArrowDown": "down",
            "KeyS": "down",
            "ArrowLeft": "left",
            "KeyA": "left",
            "ArrowRight": "right",
            "KeyD": "right",
        }
    }

    // Getter for the currently held direction
    get direction() {
        return this.heldDirections[0];
    }

    init() {
        document.addEventListener("keydown", e => {
            const dir = this.map[e.code];

            if (dir && this.heldDirections.indexOf(dir) === -1) {
                this.heldDirections.unshift(dir);
            }
        });

        document.addEventListener("keyup", e => {
            const dir = this.map[e.code];
            const index = this.heldDirections.indexOf(dir);

            if (index > -1) {
                this.heldDirections.splice(index, 1);
            }
        })

    }
}