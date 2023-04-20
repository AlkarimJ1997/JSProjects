window.BattleAnimations = {
    async spin(event, onComplete) {
        // Get the caster's pizza
        const element = event.caster.pizzaElement;

        // Get the left or right spin animation based on who is attacking
        const animationClassName = event.caster.team === "player" ? "battle-spin-right" : "battle-spin-left";

        // Add the animation class to the pizza
        element.classList.add(animationClassName);

        // Remove the animation class when the animation is complete (using an event)
        element.addEventListener("animationend", () => {
            element.classList.remove(animationClassName);
        }, { once: true });

        // Wait for the pizzas to collide, then continue with the battle cycle
        await utils.wait(100);
        onComplete();
    },
    async glob(event, onComplete) {
        // Get the caster
        const { caster } = event;

        // Create container to put the glob in
        const div = document.createElement("div");

        // Add the glob and its animation to the container
        div.classList.add("glob-orb");
        div.classList.add(caster.team === "player" ? "battle-glob-right" : "battle-glob-left");

        // Adding the SVG for the glob projectile to the container
        div.innerHTML = (`
                <svg viewBox="0 0 32 32" width="32" height="32">
                    <circle cx="16" cy="16" r="16" fill="${event.color}" />
                </svg>
            `
        );

        //Remove the element from the DOM when the animation is complete (using an event)
        div.addEventListener("animationend", () => {
            div.remove();
        });

        //Add the glob container to the battle scene
        document.querySelector(".Battle").appendChild(div);

        // Wait for the glob to collide with the target, then continue with the battle cycle
        await utils.wait(820);
        onComplete();
    }
}