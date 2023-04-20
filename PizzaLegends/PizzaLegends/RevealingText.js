class RevealingText {
    constructor(config) {
        // Element to have the spans added to
        this.element = config.element;

        // Text to be revealed
        this.text = config.text;

        // Time to wait between each letter
        this.speed = config.speed || 60;

        this.timeout = null;
        this.isDone = false;
    }

    // Recursive method to reveal one character at a time
    revealOneCharacter(list) {
        const nextCharacter = list.splice(0, 1)[0];

        // Reveal the character
        nextCharacter.span.classList.add("revealed");

        // If there are still characters to show, recall the method
        if (list.length > 0) {
            this.timeout = setTimeout(() => {
                this.revealOneCharacter(list);
            }, nextCharacter.delayAfter);
        } else {
            // If there are no more characters to show, set the done flag
            this.isDone = true;
        }
    }

    // Method to skip the typewriter effect if the player presses enter
    warpToDone() {
        clearTimeout(this.timeout);

        this.isDone = true;

        this.element.querySelectorAll("span").forEach(span => {
            span.classList.add("revealed");
        })
    }

    // Method to split text into spans and add them to the DOM
    init() {
        let characters = [];

        this.text.split("").forEach(character => {
            let span = document.createElement("span");

            span.textContent = character;
            this.element.appendChild(span);

            // Add the span to the internal state array
            characters.push({
                span,
                delayAfter: character === " " ? 0 : this.speed
            });
        })

        this.revealOneCharacter(characters);
    }
}