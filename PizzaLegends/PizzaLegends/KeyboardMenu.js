class KeyboardMenu {
    constructor(config = {}) {
        // Menu options for the current page (set by setOptions)
        this.options = [];

        // Binding for key presses and last focused option
        this.up = null;
        this.down = null;
        this.prevFocus = null;

        // Container for description (for the pause menu)
        this.descriptionContainer = config.descriptionContainer || null;
    }

    setOptions(options) {
        this.options = options;

        // Create a button for each option
        this.element.innerHTML = this.options.map((option, index) => {
            // Disables the button if the option is disabled
            const disabledAttr = option.disabled ? "disabled" : "";

            return (`
                <div class="option">
                    <button ${disabledAttr} data-button="${index}" data-description="${option.description}">
                        ${option.label}
                    </button>
                    <span class="right">${option.right ? option.right() : ""}</span>
                </div>
            `)
        }).join("");

        // Bind click, mouseover, to all the buttons
        this.element.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", () => {
                // Determine which option was clicked and run its handler
                const chosenOption = this.options[Number(button.dataset.button)];
                chosenOption.handler();
            })

            // Focus button on mouseover
            button.addEventListener("mouseenter", () => {
                button.focus();
            });

            // Update previous focus state and set description box to corresponding option description
            button.addEventListener("focus", () => {
                this.prevFocus = button;
                this.descriptionElementText.innerText = button.dataset.description;
            });
        });

        // Find and focus the first button that isn't disabled (delay to allow for the DOM to be updated)
        setTimeout(() => {
            this.element.querySelector("button[data-button]:not([disabled])").focus();
        }, 10);
    }

    // Method to clean up events, unbind key presses, etc. when the keyboard menu is no longer needed
    end() {
        // Remove the keyboard menu element and description box element from the DOM
        this.element.remove();
        this.descriptionElement.remove();

        // Unbind key presses
        this.up.unbind();
        this.down.unbind();
    }

    // Method to create an element for the keyboard menu and the description box
    createElement() {
        // Keyboard menu element
        this.element = document.createElement("div");
        this.element.classList.add("KeyboardMenu");

        // Description box element
        this.descriptionElement = document.createElement("div");
        this.descriptionElement.classList.add("DescriptionBox")
        this.descriptionElement.innerHTML = (`<p>I will provide information!</p>`);

        // Reference to the paragraph in the description box
        this.descriptionElementText = this.descriptionElement.querySelector("p");
    }

    // Method to append the keyboard menu element and the description box to the DOM
    init(container) {
        this.createElement();
        (this.descriptionContainer || container).appendChild(this.descriptionElement);
        container.appendChild(this.element);

        // Set bindings for key presses
        this.up = new KeyPressListener("ArrowUp", () => {
            // Get the current option that is focused using the data attribute
            const current = Number(this.prevFocus.getAttribute("data-button"));

            // All buttons that have "data-button" attributes
            const allButtons = this.element.querySelectorAll("button[data-button]");

            /* Get the previous option by finding the button from all buttons
               that has an index smaller than the current and isn't disabled.
               
               Note: created array is reversed to not get earlier elements that
               would match the criteria. 
               
               For example: Option 3 would need to become Option 2 when up arrow
               is pressed. Without reversing the array, Option 1 would match the
               criteria and be focused upon. */
            const prevButton = Array.from(allButtons).reverse().find(el => {
                return el.dataset.button < current && !el.disabled
            });

            // Focus that previous button (if it exists)
            prevButton?.focus();
        })

        this.down = new KeyPressListener("ArrowDown", () => {
            // Get the current option that is focused using the data attribute
            const current = Number(this.prevFocus.getAttribute("data-button"));

            // All buttons that have "data-button" attributes
            const allButtons = this.element.querySelectorAll("button[data-button]");

            /* Get the next option by finding the button from all buttons that
               has an index greater than the current and isn't disabled */
            const nextButton = Array.from(allButtons).find(el => {
                return el.dataset.button > current && !el.disabled
            });

            // Focus that next button (if it exists)
            nextButton?.focus();
        })
    }
}