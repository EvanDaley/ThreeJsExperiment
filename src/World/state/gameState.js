// gameState.js

import { Raycaster, Vector2 } from 'three';

export const gameState = {
    // Player
    playerName: '',
    
    // Funds
    amountPerFiling: 1,
    funds: 999999999,

    // Auto increment
    autoIncrementFrequency: 100000,
    autoIncrementTimer: 0,

    // Score
    incrementMultiplier: 1,
    score: 0,
    
    // Arms
    activeArms: 0,
    armSpeed: .2,
    cpuLevel: 0,

    // Input
    raycaster: new Raycaster(),
    pointer: new Vector2(),

    // DOM elements (populated later)
    scoreDisplay: null,
    xpDisplay: null,
    levelDisplay: null,
    fundsDisplay: null,

    // These get set but not displayed. I felt like it made the UI too confusing.
    // XP
    levelIncrementMultiplier: 1.68,
    nextXpNeeded: 5,
    xp: 1,
    level: 1,

};

// #466154FF
// #9EDABDFF
