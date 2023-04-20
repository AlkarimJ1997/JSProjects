const audio = {
    map: new Howl({
        src: './assets/audio/map.wav',
        html5: true,
        volume: 0.5
    }),
    initBattle: new Howl({
        src: './assets/audio/initBattle.wav',
        html5: true,
        volume: 0.1
    }),
    battle: new Howl({
        src: './assets/audio/battle.mp3',
        html5: true,
        volume: 0.3
    }),
    tackleHit: new Howl({
        src: './assets/audio/tackleHit.wav',
        html5: true,
        volume: 0.3
    }),
    initEmber: new Howl({
        src: './assets/audio/initFireball.wav',
        html5: true,
        volume: 0.3
    }),
    emberHit: new Howl({
        src: './assets/audio/fireballHit.wav',
        html5: true,
        volume: 0.3
    }),
    victory: new Howl({
        src: './assets/audio/victory.wav',
        html5: true,
        volume: 0.3
    })
}