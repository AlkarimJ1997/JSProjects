class TextMessage {
    constructor({ text, onComplete }) {
        this.text = text;
        this.onComplete = onComplete;
        this.element = null;
    }

    // Method to create an element for the text message
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");
        this.element.innerHTML = (`
                <p class="TextMessage_p"></p>
                <button class="TextMessage_button">Next</button>
            `
        );

        // Initialize the typewriter effect to the p tag
        this.revealingText = new RevealingText({
            text: this.text,
            element: this.element.querySelector(".TextMessage_p"),
        });

        // Add event listener to the button
        this.element.querySelector("button").addEventListener("click", () => {
            this.done();
        });

        // Add event listener for the keypress
        this.actionListener = new KeyPressListener("Enter", () => {
            this.done();
        })
    }

    // Method to close the text message (clean up binds, events, DOM manipulation)
    done() {
        if (!this.revealingText.isDone) {
            this.revealingText.warpToDone();
            return;
        }
        this.element.remove();
        this.actionListener.unbind();
        this.onComplete();
    }

    // Method to append the element to the DOM and start the typewriter effect
    init(container) {
        this.createElement();
        container.appendChild(this.element);

        this.revealingText.init();
    }
}