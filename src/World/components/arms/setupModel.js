import { Group } from 'three';

function setupModel(data, options = {}) {
    const group = new Group();
    const updatables = [];

    const swingDuration = 1.0;
    const globalSpeed = options.speed || 1.0;
    const maxRotation = Math.PI;
    const baseStagger = 0.15;
    const onSwingComplete = options.onSwingComplete || (() => {});

    const armContainer = data.scene.children[0];
    const arms = armContainer.children;

    const armControllers = [];

    for (let i = 0; i < arms.length; i++) {
        const armMesh = arms[i];

        const baseZ = armMesh.position.z;
        const baseY = armMesh.position.y;
        const baseRotationY = armMesh.rotation.y;

        const isLeftArm = armMesh.name.toLowerCase().includes('left');
        const rotationMultiplier = isLeftArm ? -1 : 1;

        const amplitudeFactor = 0.9 + Math.random() * 0.2;
        const timeOffset = i * baseStagger + Math.random() * 0.05;
        const localSpeed = globalSpeed * (0.95 + Math.random() * 0.1);

        let lastPhase = 0;
        let swingTriggered = false;

        armMesh.tick = (delta, elapsedTime) => {
            const localTime = (elapsedTime * localSpeed - timeOffset + swingDuration) % swingDuration;
            const t = localTime / swingDuration;

            // Mid-swing: rising past 0.5
            if (t >= 0.5 && !swingTriggered) {
                onSwingComplete();
                swingTriggered = true;
            }

            // Reset trigger for next swing
            if (t < 0.5 && swingTriggered) {
                swingTriggered = false;
            }

            let swing;
            if (t < 0.5) {
                swing = Math.pow(t * 2, 2);
            } else {
                swing = Math.sin((1 - (t - 0.5) * 2) * Math.PI / 2);
            }

            armMesh.position.z = baseZ + swing * 0.5 * amplitudeFactor;
            armMesh.rotation.y = baseRotationY + rotationMultiplier * swing * maxRotation * amplitudeFactor;
        };

        armControllers.push(armMesh);
    }

    group.add(armContainer);

    group.tick = (delta, elapsedTime) => {
        armControllers.forEach((arm, i) => {
            if (arm.visible) arm.tick(delta, elapsedTime);
        });
    };

    group.updateArmVisibility = (activeCount) => {
        armControllers.forEach((arm, i) => {
            arm.visible = i < activeCount;
        });
    };

    return group;
}

export { setupModel };
