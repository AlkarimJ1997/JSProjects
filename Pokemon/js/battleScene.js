// Globals
let battleAnimationId;
let draggle;
let emby;
let renderedSprites;
let battleQueue;

// Creating the battle background image element
const battleBackgroundImage = new Image();
battleBackgroundImage.src = './assets/images/battleBackground.png';

// Battle background sprite
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage,
})

// Helper functions
const setupBattle = () => {
    // Show the battle scene and hide the dialogue box
    document.querySelector('#battleInterface').style.display = 'block';
    document.querySelector('#dialogueBox').style.display = 'none';

    // Put the pokemon's and enemy's health bars back to full health
    document.querySelector('#enemyHealthBar').style.width = '100%';
    document.querySelector('#pokemonHealthBar').style.width = '100%';

    // Remove duplicate attacks
    document.querySelector('#attacksBox').replaceChildren();

    // Initializing sprites
    draggle = new Monster(monsters.Draggle);
    emby = new Monster(monsters.Emby);
    battleQueue = [];

    // Initializing dynamic sprites
    renderedSprites = [draggle, emby];

    // Populating the attacks for the current pokemon
    emby.attacks.forEach(attack => {
        const button = document.createElement('button');
        button.innerHTML = attack.name;

        document.querySelector('#attacksBox').append(button);
    })

    // Event listeners
    document.querySelectorAll('button').forEach(button => {
        // Click event for initiating an attack
        button.addEventListener('click', (e) => {
            emby.attack({
                attack: attacks[button.innerHTML],
                recipient: draggle,
                renderedSprites
            });

            // If the recipient is dead, end the battle and return to the map
            if (draggle.health <= 0) {
                battleQueue.push(() => draggle.faint());
                battleQueue.push(() => {
                    // Fade back to black and return to the map
                    gsap.to('#battleDiv', {
                        opacity: 1,
                        onComplete: () => {
                            // Cancel the battle animation loop and initiate the map animation loop
                            cancelAnimationFrame(battleAnimationId);
                            animate();

                            // Hide the battle interface
                            document.querySelector('#battleInterface').style.display = 'none';
                            gsap.to('#battleDiv', {
                                opacity: 0
                            })

                            // Allow the player to move again after the battle and play the map audio
                            battle.initiated = false;
                            audio.map.play();
                        }
                    })
                })
                return;
            }

            const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];

            // Adding the recipient's counterattack (random) to the battle queue
            battleQueue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites
                });

                // If the player's pokemon is dead, end the battle and return to the map
                if (emby.health <= 0) {
                    battleQueue.push(() => emby.faint());
                    battleQueue.push(() => {
                        // Fade back to black and return to the map
                        gsap.to('#battleDiv', {
                            opacity: 1,
                            onComplete: () => {
                                // Cancel the battle animation loop and initiate the map animation loop
                                cancelAnimationFrame(battleAnimationId);
                                animate();

                                // Hide the battle interface
                                document.querySelector('#battleInterface').style.display = 'none';
                                gsap.to('#battleDiv', {
                                    opacity: 0
                                })

                                // Allow the player to move again after the battle
                                battle.initiated = false;
                                audio.map.play();
                            }
                        })
                    })
                    return;
                }
            })
        })

        // Mouse over event for showing the attack's type
        button.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[button.innerHTML];

            document.querySelector('#typeBox').innerHTML = selectedAttack.type;
            document.querySelector('#typeBox').style.color = selectedAttack.color;
        })
    })
}

// Animation loop for battle sequence
const animateBattle = () => {
    battleAnimationId = requestAnimationFrame(animateBattle);

    // Rendering the battle scene on the canvas
    battleBackground.draw();

    // Rendering the pokemon and sprites for attacks on the canvas
    renderedSprites.forEach(sprite => sprite.draw());
}

// Starting the battle scene and animation loop
// setupBattle();
// animateBattle();

// Event listener for the dialogue box
document.querySelector('#dialogueBox').addEventListener('click', (e) => {
    // Call the enemy pokemon's counterattack if the battle queue is not empty
    if (battleQueue.length > 0) {
        battleQueue[0]();
        battleQueue.shift();
    } else e.currentTarget.style.display = 'none';
})