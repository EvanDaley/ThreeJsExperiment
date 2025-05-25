import { Group } from 'three';

function setupModel(data, options = {}) {
    const group = new Group();
    const updatables = [];

    const swingDuration = 1.0;
    const globalSpeed = options.speed || 1.0;
    const maxRotation = Math.PI; // Max rotation angle
    const baseStagger = 0.15;
    const activeArmCount = options.activeArmCount ?? Infinity;

    const armContainer = data.scene.children[0];
    const arms = armContainer.children;
    const numArms = arms.length;

    for (let i = 0; i < numArms; i++) {
        const armMesh = arms[i];

        if (i >= activeArmCount) {
            armMesh.visible = false;
            continue;
        }

        const baseZ = armMesh.position.z;
        const baseY = armMesh.position.y;
        const baseRotationY = armMesh.rotation.y;

        const isLeftArm = armMesh.name.toLowerCase().includes('left');
        const rotationMultiplier = isLeftArm ? -1 : 1;

        const amplitudeFactor = 0.9 + Math.random() * 0.2;
        const timeOffset = i * baseStagger + Math.random() * 0.05;
        const localSpeed = globalSpeed * (0.95 + Math.random() * 0.1);

        armMesh.tick = (delta, elapsedTime) => {
            const localTime = (elapsedTime * localSpeed - timeOffset + swingDuration) % swingDuration;
            const t = localTime / swingDuration;

            let swing;
            if (t < 0.5) {
                swing = Math.pow(t * 2, 2); // fast start
            } else {
                swing = Math.sin((1 - (t - 0.5) * 2) * Math.PI / 2); // smooth return
            }

            armMesh.position.z = baseZ + swing * 0.5 * amplitudeFactor;
            armMesh.rotation.y = baseRotationY + rotationMultiplier * swing * maxRotation * amplitudeFactor;
        };

        updatables.push(armMesh);
    }

    group.add(armContainer);

    group.tick = (delta, elapsedTime) => {
        updatables.forEach(mesh => mesh.tick(delta, elapsedTime));
    };

    return group;
}

export { setupModel };
