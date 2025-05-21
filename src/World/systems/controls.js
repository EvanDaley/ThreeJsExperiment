import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);

  controls.enableDamping = true;

  // forward controls.update to our custom .tick method
  controls.tick = () => {
    controls.update()
  }

  // controls.enableRotate = false;
  // controls.enablePan = false;
  controls.enableZoom = false;

  return controls;
}

export { createControls };
