import * as THREE from 'three';
import { gsap } from 'gsap';

const POOL_SIZE = 30;
const pool = [];
let sceneRef = null;

function createEnvelopeMesh() {
    const geom = new THREE.BoxGeometry(0.4, 0.2, 0.05); // simple envelope-like box
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.visible = false;
    return mesh;
}

function initEnvelopePool(scene) {
    sceneRef = scene;
    for (let i = 0; i < POOL_SIZE; i++) {
        const env = createEnvelopeMesh();
        pool.push(env);
        scene.add(env);
    }
}

function getEnvelopeFromPool() {
    return pool.find(env => !env.visible) || null;
}

function animateEnvelope({ start, end, arcHeight = 1, duration = 1.2 }) {
    const env = getEnvelopeFromPool();
    if (!env || !sceneRef) return;

    env.visible = true;
    env.material.opacity = 1;

    const jitter = () => (Math.random() - 0.5) * 0.4; // ~[-0.2, 0.2]

    // Clone and apply jitter to start and end positions
    const jitteredStart = start.clone().add(new THREE.Vector3(jitter(), jitter(), jitter()));
    const jitteredEnd = end.clone().add(new THREE.Vector3(jitter(), jitter(), jitter()));
    const jitteredArcHeight = arcHeight + (Math.random() - 0.5) * 0.2;

    env.position.copy(jitteredStart);

    const mid = new THREE.Vector3().lerpVectors(jitteredStart, jitteredEnd, 0.5);
    mid.y += jitteredArcHeight;

    const curve = new THREE.QuadraticBezierCurve3(jitteredStart, mid, jitteredEnd);
    const points = curve.getPoints(50);

    gsap.to({ t: 0 }, {
        t: 1,
        duration,
        onUpdate: function () {
            const index = Math.floor(this.targets()[0].t * 50);
            env.position.copy(points[index]);
        },
        onComplete: () => {
            gsap.to(env.material, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    env.visible = false;
                }
            });
        }
    });
}


export { initEnvelopePool, animateEnvelope };
