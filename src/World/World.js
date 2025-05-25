import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';
import { loadBots } from './components/bots/bots.js';
import { loadComputer } from './components/computer/computer.js';
import { loadGround } from './components/ground/ground.js';

import { createGround } from './components/ground.js'
import { createBackgroundParticles } from './components/particles';

import { createControls } from './systems/controls.js';
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { Vector3 } from 'three';
import * as THREE from 'three';
// import { PMREMGenerator } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';


import { Raycaster, Vector2 } from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

// A hack to see errors on the iPhone
// Todo: turn this off for production!!
let devMode = true;

if (devMode) {
  // Create the error overlay container
  const errorBox = document.createElement('div');
  errorBox.id = 'dev-error-overlay';
  errorBox.style.position = 'absolute';
  errorBox.style.top = '0';
  errorBox.style.left = '0';
  errorBox.style.width = '100%';
  errorBox.style.zIndex = '9999';
  errorBox.style.background = 'rgba(255, 0, 0, 0.85)';
  errorBox.style.color = 'white';
  errorBox.style.padding = '8px';
  errorBox.style.fontFamily = 'monospace';
  errorBox.style.fontSize = '14px';
  errorBox.style.whiteSpace = 'pre-wrap';
  errorBox.style.pointerEvents = 'none'; // So it doesn't block clicks
  document.body.appendChild(errorBox);
  // errorBox.textContent = 'Dev mode enabled';

  // Hook into global error handler
  window.onerror = function (message, source, lineno, colno, error) {
    const msg = `🚨 Error: ${message} at ${lineno}:${colno}`;
    errorBox.textContent = msg;
    console.error(msg);
  };
}

let camera
let renderer
let scene
let loop
let controls
let ground
let container
let resizer 


class World {
  constructor(targetElement) {
    container = targetElement

    this.createResponsiveScene()
    this.createLights()
    this.createGameSystems()
    this.createSceneObjects()
    this.createParticleSystems()

    // XP TRACKING
    // An amount we multiply the previous level's XP requirement by to get to the next level
    this.levelIncrementMultiplier = 1.68;
    this.nextXpNeeded = 5;
    this.xp = 1;
    this.level = 1;
    
    // BUDGET TRACKING
    this.amountPerFiling = 10;
    this.funds = 0;
    
    // CLICK TRACKING
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();

    // SCORE TRACKING
    this.incrementMultiplier = 2;   // ** RECEIVES UPGRADES ** 
    this.score = 0;
    
    // AUTO INCREMENT
    this.autoIncrementFrequency = 100000;   // ** RECEIVES UPGRADES ** 
    this.autoIncrementTimer = 0;
    this.autoIncrementUpdater = {
      tick: (delta) => {
        this.autoIncrementTimer += delta * 1000; // Convert delta to milliseconds

        if (this.autoIncrementTimer >= this.autoIncrementFrequency) {
          this.autoIncrementTimer = 0;
          this.incrementProgress();
        }
      }
    };
    loop.updatables.push(this.autoIncrementUpdater);

    // HTML ELEMENTS
    this.scoreDisplay = document.getElementById('score-display');
    this.xpDisplay = document.getElementById('xp-display');
    this.levelDisplay = document.getElementById('level-display');
    this.fundsDisplay = document.getElementById('funds-display');

    container.addEventListener('pointerdown', this.onPointerDown.bind(this));
  }

  createResponsiveScene() {
    scene = createScene();
    renderer = createRenderer();
    camera = createCamera();
    container.append(renderer.domElement);
    resizer = new Resizer(container, camera, renderer);
  }

  createLights() {
    const { ambientLight, mainLight } = createLights();
    scene.add(ambientLight, mainLight)
  }

  createGameSystems() {
    loop = new Loop(camera, scene, renderer);
    controls = createControls(camera, renderer.domElement);

    loop.updatables.push(
      controls
    );
  }

  createSceneObjects() {
    ground = createGround()

    // scene.add(
    //   ground
    // );
  }

  createParticleSystems() {
    const backgroundParticles = createBackgroundParticles()
    scene.add(backgroundParticles)
    loop.updatables.push(backgroundParticles)
  }

  async init() {
    // const hdri = await import('@pmndrs/assets/hdri/apartment.exr');
    // const loader = new EXRLoader();
    // console.error('TEST');

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const rendererCapabilities = renderer.capabilities;
    const supportsHalfFloat = rendererCapabilities.isWebGL2 || rendererCapabilities.getExtension('OES_texture_half_float');

    const dataType = supportsHalfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;

    new RGBELoader()
        .setDataType(dataType)
        .load('texture_sets/studio_small_09_2k.hdr', (hdrTexture) => {
          // const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
          hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
          
          scene.environment = hdrTexture;
          scene.background = hdrTexture;

          // hdrTexture.dispose();
          pmremGenerator.dispose();
        });

    // loader.load(
    //     hdri.default,
    //     (texture) => {
    //       texture.mapping = THREE.EquirectangularReflectionMapping;
    //       scene.environment = texture;
    //       scene.background = texture;
    //       console.log('HDRI loaded successfully');
    //     },
    //     undefined,
    //     (err) => {
    //       console.error('HDRI load failed:', err);
    //       document.body.innerHTML = `<div style="color:red;">HDRI load failed: ${err.message || err}</div>`;
    //     }
    // );

    console.error('TEST 2');

    const { robot } = await loadBots();
    const { computer } = await loadComputer();
    const { ground } = await loadGround();
  
    scene.traverse((child) => {
      if (child.isMesh && child.material && 'envMap' in child.material) {
        child.material.envMap = envMap;
        child.material.needsUpdate = true;
      }
    });
  
    controls.target.copy(robot.position);
  
    loop.updatables.push(robot);
    loop.updatables.push(computer);
    loop.updatables.push(ground);
  
    scene.add(robot);
    scene.add(computer);
    scene.add(ground);
  
    resizer.onResize();
  }

  render() {
    renderer.render(scene, camera);
  }

  start() {
    loop.start();
  }

  stop() {
    loop.stop();
  }

  onPointerDown(event) {
    // console.log('click detected');

    const rect = renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
    this.raycaster.setFromCamera(this.pointer, camera);
    const intersects = this.raycaster.intersectObjects(scene.children, true);
    for (const hit of intersects) {
      // console.log(hit.object.name);

      if (hit.object.name.startsWith('1')) {
        console.log('Profiler clicked');
        
        this.incrementProgress();
        break;
      }

      if (hit.object.name.startsWith('2')) {
        console.log('Computer clicked');
        
        const modal = document.getElementById('upgrade-modal');
        if (modal) {
          modal.style.display = 'flex';
        }

        break;
      }
    }

  }

  incrementXp(numFilings) {
    this.xp += numFilings;

    if (this.xpDisplay) {
      this.xpDisplay.textContent = `Experience: ${this.xp} / ${this.nextXpNeeded}`;
    }

    if (this.xp >= this.nextXpNeeded) {
      this.nextXpNeeded = Math.floor(this.nextXpNeeded * this.levelIncrementMultiplier);
      this.xp = 0;
      this.level += 1;

      if (this.xpDisplay) {
        this.levelDisplay.textContent = `Mastery Level: ${this.level}`;
      }
    }
  }

  incrementProgress() {
    const numFilings = this.incrementMultiplier;
    this.score += numFilings;

    this.incrementXp(numFilings);
    this.incrementFunds(numFilings);

    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `Filings Completed: ${this.score}`;
    }
    
    const labelText = `+${this.incrementMultiplier}`;
    const textSprite = this.createFloatingText(
        labelText, 
        new THREE.Vector3(0, 2.6, -1)
    );
    
    scene.add(textSprite);
    loop.updatables.push(textSprite);
  }
  
  createFloatingText(text, position) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '56px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(1.5, 0.75, 1.5); // Adjust scale for visibility

    // Add slight randomized drift
    const driftX = (Math.random() - 0.5) * 0.5;
    const driftZ = (Math.random() - 0.5) * 0.5;

    let life = 0;
    sprite.tick = (delta) => {
      sprite.position.y += delta * 1.8;
      sprite.position.x += driftX * delta;
      sprite.position.z += driftZ * delta;
      material.opacity -= delta * .9;
      life += delta;
      if (life > .9) {
        scene.remove(sprite);
        loop.updatables = loop.updatables.filter(item => item !== sprite);
      }
    };

    return sprite;
  }


  incrementFunds(numFilings) {
    this.funds += (this.amountPerFiling * numFilings);

    if (this.fundsDisplay) {
      this.fundsDisplay.textContent = `Funds: $${this.funds}`;
    }
  }
  
}

export { World };
