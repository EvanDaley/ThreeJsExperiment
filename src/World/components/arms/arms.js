import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setupModel.js';

async function loadArms() {
    const loader = new GLTFLoader();
  
    const [armsData] = await Promise.all([
      loader.loadAsync('models/Arms.glb'),
    ]);
  
    const arms = setupModel(armsData);
    
    arms.position.set(0, 0, 0);

    return {
      arms,
    };
  }

export { loadArms };