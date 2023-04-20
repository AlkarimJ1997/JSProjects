class SceneTransition {
    constructor() {
        this.element = null;
    }

    // Method to create an element for the scene transition
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("SceneTransition");
    }

    // Method to change the fade in to a fade out
    fadeOut() {
        this.element.classList.add("fade-out");

        // Event listener for when the animation ends
        this.element.addEventListener("animationend", () => {
            this.element.remove();
        }, { once: true });
    }

    // Method to append the element to the DOM and start the fade in/out effect
    init(container, callback) {
        this.createElement();
        container.appendChild(this.element);

        // Event listener for when the animation ends
        this.element.addEventListener("animationend", () => {
            callback();
        }, { once: true });
    }
}