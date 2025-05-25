import { CanvasTexture, SpriteMaterial, Sprite } from 'three';

export function createFloatingText(text, position, loop, scene, speed = 1.8, fontSize = 85, lifetime = 0.9) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px Helvetica`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new CanvasTexture(canvas);
    const material = new SpriteMaterial({ map: texture, transparent: true });
    const sprite = new Sprite(material);

    sprite.position.copy(position);
    sprite.scale.set(1.5, 0.75, 1.5);

    const driftX = (Math.random() - 0.5) * 0.5;
    const driftZ = (Math.random() - 0.5) * 0.5;

    let life = 0;
    sprite.tick = (delta) => {
        sprite.position.y += delta * speed;
        sprite.position.x += driftX * delta;
        sprite.position.z += driftZ * delta;
        material.opacity -= delta * 0.5;
        life += delta;
        if (life > lifetime) {
            scene.remove(sprite);
            loop.updatables = loop.updatables.filter((item) => item !== sprite);
        }
    };

    return sprite;
}
