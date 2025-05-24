import { WebGLRenderer } from 'three';
import * as THREE from 'three';

function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: true });

  renderer.physicallyCorrectLights = true;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3; // try 1.5–2.5 for brighter HDRI light

  return renderer;
}

export { createRenderer };
