export function bindUI(gameState) {
    gameState.scoreDisplay = document.getElementById('score-value');
    gameState.xpDisplay = document.getElementById('xp-display');
    gameState.levelDisplay = document.getElementById('level-display');
    gameState.fundsDisplay = document.getElementById('funds-value');
}