// upgrades.js
export const upgrades = [
    {
        id: 'scale_infra',
        name: '⚡ Scale Up Infrastructure',
        cost: 100,
        apply: (gameState) => {
            gameState.autoIncrementFrequency *= 0.9; // Faster autoscore
        }
    },
    {
        id: 'captcha_speed',
        name: '📈 Improve Captcha Solving Speed',
        cost: 10,
        apply: (gameState) => {
            gameState.incrementMultiplier += 1; // More filings per click
        }
    },
    {
        id: 'add_jurisdiction',
        name: '💼 Add Filing Jurisdiction',
        cost: 50,
        apply: (gameState) => {
            gameState.amountPerFiling += 2;
        }
    }
];
