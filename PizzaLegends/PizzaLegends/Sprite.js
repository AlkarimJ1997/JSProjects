class Sprite {
    constructor(config) {
        // Set the sprite's image and load it
        this.image = new Image();
        this.image.src = config.src;

        this.image.onload = () => {
            this.isLoaded = true;
        }

        // Set the sprite's shadow image and load it (if needed)
        this.shadow = new Image();
        this.useShadow = true // config.useShadow || false;

        if (this.useShadow) this.shadow.src = "./images/characters/shadow.png";

        this.shadow.onload = () => {
            this.isShadowLoaded = true;
        }

        // Configuring the animation and initial state
        this.animations = config.animations || {
            "idle-down": [[0, 0]],
            "idle-right": [[0, 1]],
            "idle-up": [[0, 2]],
            "idle-left": [[0, 3]],
            "walk-down": [[1, 0], [0, 0], [3, 0], [0, 0]],
            "walk-right": [[1, 1], [0, 1], [3, 1], [0, 1]],
            "walk-up": [[1, 2], [0, 2], [3, 2], [0, 2]],
            "walk-left": [[1, 3], [0, 3], [3, 3], [0, 3]]
        }
        this.currentAnimation = config.currentAnimation || "idle-down";
        this.currentAnimationFrame = 0;

        // How many game loops frame to show each cut of the sprite sheet
        // how many frames have elapsed
        this.animationFrameLimit = config.animationFrameLimit || 8;
        this.animationFrameProgress = this.animationFrameLimit;

        // Reference to the game object
        this.gameObject = config.gameObject;

        // Jump height
        this.jumpHeight =0;
    }

    // Getter method to get the current animation and frame
    get frame() {
        return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }

    // Method to set the sprite's animation (if it's not already in that animation)
    setAnimation(key) {
        if (this.currentAnimation !== key) {
            this.currentAnimation = key;
            this.currentAnimationFrame = 0;
            this.animationFrameProgress = this.animationFrameLimit;
        }
    }

    // Method to update the sprite's animation progress
    updateAnimationProgress() {
        if (this.animationFrameProgress > 0) {
            this.animationFrameProgress--;
            return;
        }

        // Reset the frame progress and increment the current animation frame (sprite to be drawn)
        this.animationFrameProgress = this.animationFrameLimit;
        this.currentAnimationFrame++;

        if (this.frame === undefined) this.currentAnimationFrame = 0;
    }

    // Method to draw the sprite
    draw(ctx, cameraPerson) {
        const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
        const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;

        this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

        // Array destructuring (x, y)
        const [frameX, frameY] = this.frame;

        this.isLoaded && ctx.drawImage(
            this.image,
            frameX * 32, frameY * 32,
            32, 32,
            x, y - this.jumpHeight,
            32, 32
        );

        // Update the sprite's animation progress
        this.updateAnimationProgress();
    }
}