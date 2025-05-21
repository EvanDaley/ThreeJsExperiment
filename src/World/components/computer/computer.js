import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setupModel.js';

async function loadComputer() {
    const loader = new GLTFLoader();
  
    const [computerData] = await Promise.all([
      loader.loadAsync('models/Computer.glb'),
    ]);
  
    console.log('loading computer!', computerData);
  
    const computer = setupModel(computerData);
    
    computer.position.set(0, 0, -2.5);

    return {
      computer,
    };
  }

export { loadComputer };