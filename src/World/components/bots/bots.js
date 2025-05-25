import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setupModel.js';

async function loadBots() {
    const loader = new GLTFLoader();
  
    const [robotData] = await Promise.all([
      loader.loadAsync('models/ChadRobot.glb'),
    ]);
  
    const robot = setupModel(robotData);
    
    robot.position.set(0, 0, 0);

    return {
      robot,
    };
  }

export { loadBots };