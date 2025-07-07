// ground.js

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setupModel.js';

async function loadBackWall() {
    const loader = new GLTFLoader();
  
    const [groundData] = await Promise.all([
      loader.loadAsync('models/BackWall.glb'),
    ]);
  
    const ground = setupModel(groundData);
    
    ground.position.set(0, 0, 0);

    return {
      ground,
    };
  }

export { loadBackWall };