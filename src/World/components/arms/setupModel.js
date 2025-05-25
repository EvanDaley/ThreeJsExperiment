import { Group } from 'three';

function setupModel(data) {
    const group = new Group();
    const updatables = [];

    const swingDuration = 1.0;             // Length of one swing cycle
    const speed = 2.0;                     // Global time multiplier
    const maxRotation = Math.PI * 2;       // Max rotation angle
    const stagger = 0.15;                  // Delay between each arm's start

    const armContainer = data.scene.children[0];
    const arms = armContainer.children;
    const numArms = arms.length;

    for (let i = 0; i < numArms; i++) {
        const armMesh = arms[i];
        const baseZ = armMesh.position.z;
        const baseY = armMesh.position.y;
        const baseRotationY = armMesh.rotation.y;

        const isLeftArm = armMesh.name.toLowerCase().includes('left');
        const rotationMultiplier = isLeftArm ? -1 : 1;

        const timeOffset = i * stagger;

        armMesh.tick = (delta, elapsedTime) => {
            const localTime = (elapsedTime * speed - timeOffset + swingDuration) % swingDuration;
            const swing = Math.max(0, Math.sin((localTime / swingDuration) * Math.PI));

            armMesh.position.z = baseZ + swing * 0.5;
            armMesh.rotation.y = baseRotationY + rotationMultiplier * swing * maxRotation;
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
