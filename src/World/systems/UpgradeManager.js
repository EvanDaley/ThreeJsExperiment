import { upgrades as upgradeDefinitions } from '../upgrades.js';

export class UpgradeManager {
    constructor({ gameState, arms }) {
        this.gameState = gameState;
        this.arms = arms; // this should be the arms group with updateArmVisibility()
        this.modal = document.getElementById('upgrade-modal');
        this.listEl = this.modal.querySelector('.upgrade-list');
        this.upgrades = {};

        upgradeDefinitions.forEach((def) => {
            this.upgrades[def.id] = {
                ...def,
                level: 1,
                cost: def.costFn ? def.costFn(1) : def.baseCost,
            };
        });

        this.initEventListeners();
    }

    initEventListeners() {
        const closeBtn = this.modal.querySelector('#close-upgrade-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
    }

    showModal() {
        this.renderUpgrades();
        this.modal.style.display = 'flex';
    }

    hideModal() {
        this.modal.style.display = 'none';
    }

    renderUpgrades() {
        this.listEl.innerHTML = '';

        Object.values(this.upgrades).forEach((upgrade) => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.dataset.upgradeId = upgrade.id;

            card.innerHTML = `
        <div class="upgrade-level">Lv ${upgrade.level}</div>
        <div class="upgrade-icon">${upgrade.icon}</div>
        <div class="upgrade-info">
          <div class="upgrade-title">${upgrade.title}</div>
          <button class="upgrade-cta">Upgrade – $${upgrade.cost}</button>
        </div>
      `;

            card.querySelector('.upgrade-cta').addEventListener('click', () => {
                this.applyUpgrade(upgrade.id);
            });

            this.listEl.appendChild(card);
        });
    }

    applyUpgrade(id) {
        const upgrade = this.upgrades[id];
        if (!upgrade) return;

        if (this.gameState.funds < upgrade.cost) {
            console.warn('Not enough funds!');
            return;
        }

        this.gameState.funds -= upgrade.cost;
        upgrade.apply(this.gameState);
        upgrade.level += 1;

        // Recalculate cost
        if (upgrade.costFn) {
            upgrade.cost = upgrade.costFn(upgrade.level);
        } else {
            upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level - 1));
        }

        // If arms count changed, update visibility
        if (id === 'scale_infra' && this.arms?.updateArmVisibility) {
            this.arms.updateArmVisibility(this.gameState.activeArms);
        }

        // Update funds display
        if (this.gameState.fundsDisplay) {
            this.gameState.fundsDisplay.textContent = `$${this.gameState.funds}`;
        }

        this.renderUpgrades(); // Rerender modal to reflect changes
    }
}
