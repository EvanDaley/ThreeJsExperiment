import * as THREE from 'three';
import { createFloatingText } from './createFloatingText.js';

export function spawnFloatingText({
                                      label,
                                      position = new THREE.Vector3(1, 2, 2),
                                      loop,
                                      scene,
                                      speed,
                                      fontSize,
                                      duration,
                                  }) {
    const textSprite = createFloatingText(label, position, loop, scene, speed, fontSize, duration);
    scene.add(textSprite);
    loop.updatables.push(textSprite);
}
