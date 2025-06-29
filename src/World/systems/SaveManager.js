// systems/SaveManager.js

const SAVE_KEY = 'myGameSave';

function save(gameState, upgradeManager) {
    try {
        const data = {
            gameData: {
                playerName: gameState.playerName,
                amountPerFiling: gameState.amountPerFiling,
                funds: gameState.funds,
                autoIncrementFrequency: gameState.autoIncrementFrequency,
                incrementMultiplier: gameState.incrementMultiplier,
                score: gameState.score,
                activeArms: gameState.activeArms,
                armSpeed: gameState.armSpeed,
                cpuLevel: gameState.cpuLevel,
                xp: gameState.xp,
                level: gameState.level,
                nextXpNeeded: gameState.nextXpNeeded,
            },
            upgradeData: upgradeManager.getUpgradeRawData()
        };

        console.log('saving', JSON.stringify(data))

        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        console.log('[SaveManager] Game saved.');
    } catch (e) {
        console.error('[SaveManager] Save failed:', e);
    }
}

function load(gameState, upgradeManager) {
    try {
        const json = localStorage.getItem(SAVE_KEY);
        if (!json) return;

        const data = JSON.parse(json);

        if (data.gameData) {
            Object.assign(gameState, data.gameData);
        }

        if  (data.upgradeData) {
            upgradeManager.setUpgradeLevels(data.upgradeData)
        }

        console.log('[SaveManager] Game loaded.');
    } catch (e) {
        console.error('[SaveManager] Load failed:', e);
    }
}

function clear() {
    localStorage.removeItem(SAVE_KEY);
    console.log('[SaveManager] Save data cleared.');
}

export const SaveManager = {
    save,
    load,
    clear,
};
