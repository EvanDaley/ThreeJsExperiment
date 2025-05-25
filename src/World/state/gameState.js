// gameState.js

import { Raycaster, Vector2 } from 'three';

export const gameState = {
    // Funds
    amountPerFiling: 10,
    funds: 0,

    // Auto increment
    autoIncrementFrequency: 10,
    autoIncrementTimer: 0,

    // Score
    incrementMultiplier: 100,
    score: 0,
    
    // Arms
    activeArms: 8,
    armSpeed: 5,

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
