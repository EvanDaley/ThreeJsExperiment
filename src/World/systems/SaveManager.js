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

        console.warn('SAVING', JSON.stringify(data))

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
            console.log('[SaveManager] Loading game data.');
            Object.assign(gameState, data.gameData);
            console.log(gameState)
        }

        if  (data['upgradeData']) {
            console.log('[SaveManager] Loading upgrade data.');
            upgradeManager.setUpgradeLevels(data['upgradeData'])
        }

        console.log('[SaveManager] Game loaded.');
        console.log(data);
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
