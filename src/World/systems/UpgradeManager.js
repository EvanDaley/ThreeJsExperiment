import { upgrades as upgradeDefinitions } from '../upgrades.js';

export class UpgradeManager {
    constructor({ gameState, arms }) {
        this.gameState = gameState;
        this.arms = arms;
        this.modal = document.getElementById('upgrade-modal');
        this.listEl = this.modal.querySelector('.upgrade-list');
        this.popupEl = document.getElementById('upgrade-popup');
        this.closeBtnId = 'close-upgrade-modal';
        this.upgrades = {};

        upgradeDefinitions.forEach((def) => {
            this.upgrades[def.id] = {
                ...def,
                level: 1,
                cost: def.costFn ? def.costFn(1) : def.baseCost,
                _cardEl: null, // cache DOM node here
            };
        });

        this.initEventListeners();
    }

    initEventListeners() {
        this.modal.addEventListener('click', (e) => {
            const target = e.target;

            // Close modal
            if (target.id === this.closeBtnId) {
                this.hideModal();
            }

            // Upgrade button
            if (target.classList.contains('upgrade-cta')) {
                const card = target.closest('.upgrade-card');
                const upgradeId = card?.dataset.upgradeId;
                if (upgradeId) {
                    this.applyUpgrade(upgradeId);
                }
            }
        });
    }

    showModal() {
        this.renderUpgrades();
        this.modal.style.display = 'flex';
    }

    hideModal() {
        this.modal.style.display = 'none';
    }

    showUpgradePopup(message = 'UPGRADED!') {
        if (!this.popupEl) return;

        this.popupEl.textContent = message;
        this.popupEl.classList.remove('show');
        setTimeout(() => this.popupEl.classList.add('show'), 10);
    }

    renderUpgrades() {
        this.listEl.innerHTML = '';
        Object.values(this.upgrades).forEach((upgrade) => {
            const card = this.renderUpgradeCard(upgrade);
            this.listEl.appendChild(card);
        });
    }

    renderUpgradeCard(upgrade) {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.dataset.upgradeId = upgrade.id;

        const currentValue = this.getCurrentUpgradeValue(upgrade.id);
        const isMaxed = upgrade.max !== undefined && currentValue >= upgrade.max;
        const levelLabel = isMaxed ? `MAX (${upgrade.level})` : `Lv ${upgrade.level}`;
        const formattedCost =
            upgrade.cost > 100 ? upgrade.cost.toLocaleString() : upgrade.cost;

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

        // Cache DOM node for later fast access
        upgrade._cardEl = card;

        return card;
    }

    applyUpgrade(id) {
        const upgrade = this.upgrades[id];
        if (!upgrade) return;

        const currentValue = this.getCurrentUpgradeValue(id);

        if (upgrade.max !== undefined && currentValue >= upgrade.max) {
            return;
        }

        if (this.gameState.funds < upgrade.cost) {
            const card = upgrade._cardEl;
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

        upgrade.cost = upgrade.costFn
            ? upgrade.costFn(upgrade.level)
            : Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level - 1));

        // Hooks
        if (id === 'scale_infra' && this.arms?.updateArmVisibility) {
            this.arms.updateArmVisibility(this.gameState.activeArms);
        }

        if (id === 'boost_cpu' && this.arms?.updateSpeed) {
            this.arms.updateSpeed(this.gameState.armSpeed);
        }

        if (this.gameState.fundsDisplay) {
            this.gameState.fundsDisplay.textContent = `$${this.gameState.funds}`;
        }

        const message =
            upgrade.max !== undefined &&
            this.getCurrentUpgradeValue(id) + 1 > upgrade.max
                ? 'MAXED!!!'
                : upgrade.message || 'UPGRADED!';

        this.showUpgradePopup(message);

        // Replace just the affected card
        const oldCard = upgrade._cardEl;
        if (oldCard) {
            const newCard = this.renderUpgradeCard(upgrade);
            this.listEl.replaceChild(newCard, oldCard);
        }
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
