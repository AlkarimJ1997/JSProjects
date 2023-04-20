class KeyPressListener {
    constructor(keyCode, callback) {
        let keySafe = true;

        this.keydownFunction = function (event) {
            if (event.code === keyCode) {
                if (keySafe) {
                    keySafe = false;
                    callback();
                }
            }
        };

        this.keyupFunction = function (event) {
            if (event.code === keyCode) {
                keySafe = true;
            }
        };

        // Add the event listeners
        document.addEventListener("keydown", this.keydownFunction);
        document.addEventListener("keyup", this.keyupFunction);
    }

    // Method to unbind the event listeners
    unbind() {
        document.removeEventListener("keydown", this.keydownFunction);
        document.removeEventListener("keyup", this.keyupFunction);
    }
}