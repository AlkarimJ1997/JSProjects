const utils = {
    withGrid(n) {
        return n * 16;
    },
    asGridCoord(x, y) {
        return `${x * 16},${y * 16}`;
    },
    nextPosition(initialX, initialY, direction) {
        let x = initialX;
        let y = initialY;

        const size = 16;

        switch (direction) {
            case "left":
                x -= size;
                break;
            case "right":
                x += size;
                break;
            case "up":
                y -= size;
                break;
            case "down":
                y += size;
                break;
            default:
                break;
        }

        return { x, y };
    },
    oppositeDirection(direction) {
        switch (direction) {
            case "left":
                return "right";
            case "right":
                return "left";
            case "up":
                return "down";
            default:
                return "up";
        }
    },
    getDirection(who, target) {
        let direction = null;

        if (who.x < target.x) {
            direction = "right";
        } else if (who.x > target.x) {
            direction = "left";
        } else if (who.y > target.y) {
            direction = "up";
        } else if (who.y < target.y) {
            direction = "down";
        }

        return direction;
    },
    wait(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, ms);
        })
    },
    randomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    // withinOneTile(hero, target) {
    //     const { x, y } = hero;
    //     const { x: targetX, y: targetY } = target;

    //     const withinX = x + 16 === targetX && y === targetY || x - 16 === targetX && y === targetY;
    //     const withinY = x === targetX && y + 16 === targetY || x === targetX && y - 16 === targetY;

    //     return withinX || withinY;
    // }
    withinOneTile(hero, target) {
        const { x, y } = hero;
        const { x: targetX, y: targetY } = target;

        const npcRight = x + 16 === targetX && y === targetY;
        const npcLeft = x - 16 === targetX && y === targetY;
        const npcDown = x === targetX && y + 16 === targetY;
        const npcUp = x === targetX && y - 16 === targetY;

        if (npcRight) return { within: true, direction: "right" };
        if (npcLeft) return { within: true, direction: "left" };
        if (npcDown) return { within: true, direction: "down" };
        if (npcUp) return { within: true, direction: "up" };

        return { within: false };
    }
    ,
    emitEvent(name, detail) {
        const event = new CustomEvent(name, { detail });
        document.dispatchEvent(event);
    }
}