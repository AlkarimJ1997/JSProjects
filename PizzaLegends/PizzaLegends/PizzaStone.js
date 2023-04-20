class PizzaStone extends GameObject {
    constructor(config) {
        // Call the super constructor
        super(config);

        // Appearance of Pizza Stone
        this.sprite = new Sprite({
            gameObject: this,
            src: "/images/characters/pizza-stone.png",
            animations: {
                "used-down": [[0, 0]],
                "unused-down": [[1, 0]],
            },
            currentAnimation: "used-down"
        });

        // Story flag for if the Pizza Stone is used or not (for appearance and interaction)
        this.storyFlag = config.storyFlag;

        // Pizzas that this Pizza Stone can craft (give to player)
        this.pizzas = config.pizzas;

        // Talking behaviour of the Pizza Stone
        this.talking = [
            {
                required: [this.storyFlag],
                events: [
                    { type: "textMessage", text: "You have already used this." },
                ]
            },
            {
                events: [
                    { type: "textMessage", text: "Approaching the legendary pizza stone..." },
                    { type: "craftingMenu", pizzas: this.pizzas },
                    { type: "addStoryFlag", flag: this.storyFlag }
                ]
            }
        ]
    }

    // Method to update the Pizza Stone's appearance and interaction
    update() {
        this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag] ? "used-down" : "unused-down";
    }
}