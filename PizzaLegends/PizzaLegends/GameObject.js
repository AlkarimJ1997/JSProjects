class GameObject {
    constructor(config) {
        this.id = null;
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.direction = config.direction || "down";
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "./images/characters/people/hero.png",
        });

        // Behavior loops for each game object
        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;

        // Talking loops for each game object
        this.talking = config.talking || [];
    }

    // Method to add wall whenever game object is mounted
    mount(map) {
        this.isMounted = true;
        map.addWall(this.x, this.y);

        // If the game object has a behavior loop, start it
        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10);
    }

    update() {

    }

    // Method to do the behavior loop for the game object
    async doBehaviorEvent(map) {
        // If a global cutscene is playing, there is no behavior loop,
        // or the person is standing, stop
        if (map.isCutscenePlaying || !this.behaviorLoop.length || this.isStanding) return;

        // Get the event configuration and set the owner of the loop
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;

        // Event handler for overworld event
        const eventHandler = new OverworldEvent({ map, event: eventConfig });
        await eventHandler.init();

        // Once event is finished, move to the next event
        this.behaviorLoopIndex++;

        // If loop has finished, reset the loop
        if (this.behaviorLoopIndex >= this.behaviorLoop.length) this.behaviorLoopIndex = 0;

        // Do the loop again
        this.doBehaviorEvent(map);
    }
}