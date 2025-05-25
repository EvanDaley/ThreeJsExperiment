import { AnimationMixer, Group } from 'three';

function setupModel(data) {
    const group = new Group();
    const updatables = [];
    const mixers = [];
    const actions = [];

    for (let i = 0; i < data.scene.children.length; i++) {
        const model = data.scene.children[i];
        const clip = data.animations[i];

        if (clip) {
            const mixer = new AnimationMixer(model);
            const action = mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = 1; // Play once
            mixers.push(mixer);
            actions.push(action);
        }

        group.add(model);
    }

    // Tick updates all mixers
    group.tick = (delta) => {
        mixers.forEach((mixer) => mixer.update(delta));
    };

    // Expose actions for sequencing
    group.__armActions = actions;

    return group;
}

export { setupModel };
