import { AnimationMixer, Group, MathUtils } from 'three';

function setupModel(data) {
    const group = new Group()
    const updatables = []

    for (let i = 0; i < data.scene.children.length; i++) {
        const model = data.scene.children[i];

        const clip = data.animations[i];

        model.tick = (delta) => { };

        if (clip) {
            const mixer = new AnimationMixer(model);
            const action = mixer.clipAction(clip);
            action.play();

            model.tick = (delta) => mixer.update(delta);
        }

        group.add(model)
        updatables.push(model)
    }

    const radiansPerSecond = MathUtils.degToRad(-3);

    group.tick = (delta) => {
        // for (const object of updatables) {
        //     object.tick(delta);
        // }

        // group.rotation.x += radiansPerSecond * delta;
        // group.rotation.y += radiansPerSecond * delta;
    };

    return group;
}

export { setupModel };