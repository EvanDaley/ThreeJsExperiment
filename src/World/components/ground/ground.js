import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setupModel.js';

async function loadGround() {
    const loader = new GLTFLoader();
  
    const [groundData] = await Promise.all([
      loader.loadAsync('models/Ground.glb'),
    ]);
  
    const ground = setupModel(groundData);
    
    ground.position.set(0, 0, 0);

    return {
      ground,
    };
  }

export { loadGround };