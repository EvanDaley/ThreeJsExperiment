export class UpgradeManager {
    constructor({ gameState, arms }) {
        this.gameState = gameState;
        this.arms = arms;
        this.modal = document.getElementById('upgrade-modal');

        this.initEventListeners();
    }

    initEventListeners() {
        // Add event listeners to buttons in modal
        // Each should call this.applyUpgrade(...)
    }

    showModal() {
        this.modal.style.display = 'flex';
    }

    hideModal() {
        this.modal.style.display = 'none';
    }

    applyUpgrade(upgradeId) {
        // Update gameState based on upgradeId
        // Possibly modify arms, armSpeed, etc.
        // Replace current upgrade with a new one
    }
}
