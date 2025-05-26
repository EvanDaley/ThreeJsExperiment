import { upgrades as upgradeDefinitions } from '../upgrades.js';

export class UpgradeManager {
    constructor({ gameState, arms }) {
        this.gameState = gameState;
        this.arms = arms;
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

    showUpgradePopup(message = "UPGRADED!") {
        console.log("showing upgrade popup")
        
        const popup = document.getElementById('upgrade-popup');
        if (!popup) return;

        popup.textContent = message;
        popup.classList.remove('show'); // reset if it's still animating
        void popup.offsetWidth; // force reflow
        popup.classList.add('show');
    }

    renderUpgrades() {
        this.listEl.innerHTML = '';

        Object.values(this.upgrades).forEach((upgrade) => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.dataset.upgradeId = upgrade.id;

            const currentValue = this.getCurrentUpgradeValue(upgrade.id);
            const isMaxed = upgrade.max !== undefined && currentValue >= upgrade.max;

            const levelLabel = isMaxed ? `MAX (${upgrade.level})` : `Lv ${upgrade.level}`;

            const formattedCost = upgrade.cost > 100
                ? upgrade.cost.toLocaleString()
                : upgrade.cost;

            card.innerHTML = `
                <div class="upgrade-level">${levelLabel}</div>
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-title">${upgrade.title}</div>
                    ${
                            isMaxed
                                ? ''
                                : `<button class="upgrade-cta">$${formattedCost}</button>`
                        }
                </div>
            `;

            if (!isMaxed) {
                card.querySelector('.upgrade-cta').addEventListener('click', () => {
                    this.applyUpgrade(upgrade.id);
                });
            }

            this.listEl.appendChild(card);
        });
    }

    applyUpgrade(id) {
        const upgrade = this.upgrades[id];
        if (!upgrade) return;

        const currentValue = this.getCurrentUpgradeValue(id);

        if (upgrade.max !== undefined && currentValue >= upgrade.max) {
            console.warn(`Upgrade "${id}" is already at max.`);
            return;
        }

        if (this.gameState.funds < upgrade.cost) {
            const card = this.listEl.querySelector(`[data-upgrade-id="${id}"]`);
            const button = card?.querySelector('.upgrade-cta');
            if (button) {
                button.classList.add('not-enough');
                setTimeout(() => button.classList.remove('not-enough'), 300);
            }
            return;
        }

        this.gameState.funds -= upgrade.cost;
        upgrade.apply(this.gameState);
        upgrade.level += 1;

        // Recalculate cost
        upgrade.cost = upgrade.costFn
            ? upgrade.costFn(upgrade.level)
            : Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level - 1));

        // Special behavior hooks
        if (id === 'scale_infra' && this.arms?.updateArmVisibility) {
            this.arms.updateArmVisibility(this.gameState.activeArms);
        }

        if (id === 'boost_cpu' && this.arms?.updateSpeed) {
            this.arms.updateSpeed(this.gameState.armSpeed);
        }

        if (this.gameState.fundsDisplay) {
            this.gameState.fundsDisplay.textContent = `$${this.gameState.funds}`;
        }

        if (upgrade.max !== undefined && this.getCurrentUpgradeValue(id) + 1 > upgrade.max) {
            this.showUpgradePopup('MAXED!!!');
        } else {
            this.showUpgradePopup(upgrade.message || 'UPGRADED!');
        }


        this.renderUpgrades();
    }

    getCurrentUpgradeValue(id) {
        switch (id) {
            case 'scale_infra':
                return this.gameState.activeArms;
            case 'boost_cpu':
                return this.gameState.cpuLevel;
            case 'add_threads':
                return this.gameState.incrementMultiplier;
            default:
                return 0;
        }
    }
}
