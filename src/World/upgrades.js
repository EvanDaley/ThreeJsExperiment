export const upgrades = [
    {
        id: 'scale_infra',
        icon: '⚡',
        title: 'Scale Infra (Arms +1)',
        baseCost: 10,
        costFn: (level) => Math.floor(10 + 10 * Math.pow(2.2, level - 1)), // exponential growth
        apply: (gameState) => {
            gameState.activeArms += 1;
        },
    },
    {
        id: 'boost_cpu',
        icon: '📈',
        title: 'Boost CPU (Arm Speed +1)',
        baseCost: 10,
        apply: (gameState) => {
            gameState.armSpeed += 1;
        },
    },
    {
        id: 'add_threads',
        icon: '💼',
        title: 'Add Threads (+1 Filing Per Move)',
        baseCost: 50,
        apply: (gameState) => {
            gameState.incrementMultiplier += 1;
        },
    }
];
