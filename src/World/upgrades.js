export const upgrades = [
    {
        id: 'scale_infra',
        icon: '⚡',
        title: 'Scale Infra (Arms +1)',
        baseCost: 10,
        costFn: (level) => Math.floor(10 * Math.pow(2.8, level - 1)),
        max: 8,
        apply: (gameState) => {
            gameState.activeArms += 1;
        },
        message: 'ARM ADDED!',
    },
    {
        id: 'boost_cpu',
        icon: '📈',
        title: 'Boost CPU (Arm Speed +0.1)',
        baseCost: 20,
        costFn: (level) => Math.floor(20 * Math.pow(1.4, level - 1)),
        max: 39,
        apply: (gameState) => {
            gameState.cpuLevel += 1;
            gameState.armSpeed += 0.1;
        },
        message: 'CPU BOOSTED!',
    },
    {
        id: 'add_threads',
        icon: '💼',
        title: 'Add Threads (+1 Filing Per Move)',
        baseCost: 50,
        costFn: (level) => Math.floor(40 * Math.pow(2.1, level - 1)),
        max: 255,
        apply: (gameState) => {
            gameState.incrementMultiplier += 1;
        },
        message: 'THREAD ADDED!',
    }
];
