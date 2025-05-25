import { AnimationMixer, Group } from 'three';
import { gsap } from 'gsap';

function findHead(object) {
    if (object.name.startsWith('H')) {
        return object;
    }

    for (let i = 0; i < object.children.length; i++) {
        const found = findHead(object.children[i]);
        if (found) return found;
    }

    return null;
}

function setupModel(data) {
    const group = new Group();
    const updatables = [];
    let head = null;
    let originalY = null;
    let isBouncing = false;
    let queuedBounce = false;

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

        const foundHead = findHead(model);
        if (!head && foundHead) {
            head = foundHead;
            originalY = head.position.y;
        }

        group.add(model);
        updatables.push(model);
    }

    group.tick = (delta) => {
        // updatables.forEach(obj => obj.tick(delta));
    };

    group.triggerHeadBounce = () => {
        if (!head || originalY === null) return;

        if (isBouncing) {
            queuedBounce = true;
            return;
        }

        isBouncing = true;
        gsap.killTweensOf(head.position);

        gsap.to(head.position, {
            y: originalY + 0.05,    // smaller bounce
            duration: 0.13,         // slower bounce
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                head.position.y = originalY;
                isBouncing = false;

                if (queuedBounce) {
                    queuedBounce = false;
                    group.triggerHeadBounce();
                }
            }
        });
    };


    return group;
}

export { setupModel };
