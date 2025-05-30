import { PerspectiveCamera } from 'three';

function createCamera() {
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);

  camera.position.set(3, 3.8, 15.5);

  return camera;
}

export { createCamera };
