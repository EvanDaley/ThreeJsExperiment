import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);

  controls.enableDamping = true;
  controls.dampingFactor = 0.02; // Lower is less responsive (default is 0.05)

  // Slow down responsiveness
  controls.rotateSpeed = 0.1; // Default is 1.0
  controls.zoomSpeed = 0.1;   // Default is 1.0
  controls.panSpeed = 0.2;    // Default is 1.0

  // Optional: add boundaries to keep interaction constrained
  controls.minDistance = 5;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI / 2.2; // restrict vertical rotation
  controls.minPolarAngle = 0.1;

  controls.enableDamping = true;

  // forward controls.update to our custom .tick method
  controls.tick = () => {
    controls.update()
  }

  // TODO: Decide what level of panning/zooming we want
  // controls.enableRotate = false;
  // controls.enablePan = false;
  // controls.enableZoom = false;

  return controls;
}

export { createControls };
