import { Group } from 'three';

function setupModel(data, options = {}) {
    const group = new Group();
    const updatables = [];

    const swingDuration = 1.0;
    let globalSpeed = options.speed || 1.0;
    const maxRotation = Math.PI;
    const baseStagger = 0.15;
    const onSwingComplete = options.onSwingComplete || (() => {});

    const armContainer = data.scene.children[0];
    const arms = armContainer.children;

    const armControllers = [];

    for (let i = 0; i < arms.length; i++) {
        const armMesh = arms[i];

        armMesh.baseZ = armMesh.position.z;
        armMesh.baseY = armMesh.position.y - 0.5;
        armMesh.baseRotationY = armMesh.rotation.y;

        armMesh.isLeftArm = armMesh.name.toLowerCase().includes('left');
        armMesh.rotationMultiplier = armMesh.isLeftArm ? -1 : 1;

        armMesh.amplitudeFactor = 0.9 + Math.random() * 0.2;
        armMesh.timeOffset = i * baseStagger + Math.random() * 0.05;
        armMesh.localSpeed = globalSpeed * (0.95 + Math.random() * 0.1);
        armMesh.firstSwingTriggered = false;
        armMesh.secondSwingTriggered = false;

        armMesh.tick = (delta, elapsedTime) => {
            const localTime = (elapsedTime * armMesh.localSpeed - armMesh.timeOffset + swingDuration) % swingDuration;
            const t = localTime / swingDuration;

            if (!armMesh.firstSwingTriggered && t >= 0.3) {
                onSwingComplete();
                armMesh.firstSwingTriggered = true;
            }

            if (!armMesh.secondSwingTriggered && t >= 0.79) {
                onSwingComplete();
                armMesh.secondSwingTriggered = true;
            }

            // Reset triggers at the start of a new cycle
            if (t < 0.3) {
                armMesh.firstSwingTriggered = false;
                armMesh.secondSwingTriggered = false;
            }

            let swing;
            if (t < 0.5) {
                swing = Math.pow(t * 2, 2);
            } else {
                swing = Math.sin((1 - (t - 0.5) * 2) * Math.PI / 2);
            }

            armMesh.position.z = armMesh.baseZ + swing * 0.5 * armMesh.amplitudeFactor;
            armMesh.rotation.y = armMesh.baseRotationY + armMesh.rotationMultiplier * swing * maxRotation * armMesh.amplitudeFactor;
        };

        armControllers.push(armMesh);
    }

    group.add(armContainer);

    group.tick = (delta, elapsedTime) => {
        armControllers.forEach((arm) => {
            if (arm.visible) arm.tick(delta, elapsedTime);
        });
    };

    group.updateArmVisibility = (activeCount) => {
        armControllers.forEach((arm, i) => {
            arm.visible = i < activeCount;
        });
    };

    group.updateSpeed = (newSpeed) => {
        globalSpeed = newSpeed;
        armControllers.forEach((arm) => {
            arm.localSpeed = newSpeed;
        });
    };

    return group;
}

export { setupModel };
