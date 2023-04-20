class TitleScreen {
    constructor({ progress }) {
        // Dependency needed for loading existing progress
        this.progress = progress;
    }

    // Method to update the Title Screen (get different options)
    getOptions(resolve) {
        // Check if a save file exists
        const saveFile = this.progress.getSaveFile();

        return [
            {
                label: "New Game",
                description: "Start a new Pizza adventure!",
                handler: () => {
                    // Clean up the Title Screen element and resolve the promise
                    this.close();
                    resolve();
                },
            },
            saveFile
                ? {
                    label: "Continue Game",
                    description: "Resume your Pizza adventure!",
                    handler: () => {
                        // Clean up the Title Screen element and resolve the promise with the save file data
                        this.close();
                        resolve(saveFile);
                    },
                }
                : null,
        ].filter((v) => v); // Remove null values
    }

    // Method to create an element for the Title Screen
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TitleScreen");
        this.element.innerHTML = `
            <img class="TitleScreen_logo" src="/images/logo.png" alt="Pizza Legends" />
        `;
    }

    // Method to close the Title screen (clean up events, unbind key presses, remove DOM manipulation)
    close() {
        this.keyboardMenu.end();
        this.element.remove();
    }

    // Method to append the Title Screen element to the DOM
    async init(container) {
        return new Promise((resolve) => {
            this.createElement();
            container.appendChild(this.element);

            // Create a keyboard menu for the Title Screen
            this.keyboardMenu = new KeyboardMenu();
            this.keyboardMenu.init(this.element);
            this.keyboardMenu.setOptions(this.getOptions(resolve));
        });
    }
}
