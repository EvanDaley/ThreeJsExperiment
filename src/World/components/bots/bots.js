import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setupModel.js';

async function loadBots() {
    const loader = new GLTFLoader();
  
    const [chadData] = await Promise.all([
      loader.loadAsync('models/ChadRobot.glb'),
    ]);
  
    console.log('load!', chadData);
  
    const chad = setupModel(chadData);
    
    chad.position.set(0, -10, -2.5);

    return {
      chad,
    };
  }

export { loadBots };