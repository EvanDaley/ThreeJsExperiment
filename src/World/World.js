import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';

import { loadBots } from './components/bots/bots.js';
import { loadArms } from './components/arms/arms.js';
import { loadComputer } from './components/computer/computer.js';
import { loadGround } from './components/ground/ground.js';

import { createGround } from './components/ground.js';
import { createBackgroundParticles } from './components/particles';

import { createControls } from './systems/controls.js';
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';

import { Vector3, PMREMGenerator, CanvasTexture, SpriteMaterial, Sprite } from 'three';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { gameState } from './state/gameState.js';

// Optional dev error overlay
let devMode = false;

if (devMode) {
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
  errorBox.style.pointerEvents = 'none';
  document.body.appendChild(errorBox);

  window.onerror = function (message, source, lineno, colno, error) {
    const msg = `🚨 Error: ${message} at ${lineno}:${colno}`;
    errorBox.textContent = msg;
    console.error(msg);
  };
}

let camera, renderer, scene, loop, controls, ground, container, resizer;

class World {
  constructor(targetElement) {
    container = targetElement;

    this.createResponsiveScene();
    this.createLights();
    this.createGameSystems();
    this.createSceneObjects();
    this.createParticleSystems();

    gameState.scoreDisplay = document.getElementById('score-value');
    gameState.xpDisplay = document.getElementById('xp-display');
    gameState.levelDisplay = document.getElementById('level-display');
    gameState.fundsDisplay = document.getElementById('funds-value');

    gameState.autoIncrementUpdater = {
      tick: (delta) => {
        gameState.autoIncrementTimer += delta * 1000;
        if (gameState.autoIncrementTimer >= gameState.autoIncrementFrequency) {
          gameState.autoIncrementTimer = 0;
          this.incrementProgress();
        }
      },
    };
    loop.updatables.push(gameState.autoIncrementUpdater);

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
    scene.add(ambientLight, mainLight);
  }

  createGameSystems() {
    loop = new Loop(camera, scene, renderer);
    controls = createControls(camera, renderer.domElement);
    loop.updatables.push(controls);
  }

  createSceneObjects() {
    ground = createGround();
  }

  createParticleSystems() {
    const backgroundParticles = createBackgroundParticles();
    scene.add(backgroundParticles);
    loop.updatables.push(backgroundParticles);
  }

  async init() {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const supportsHalfFloat = renderer.capabilities.isWebGL2 || renderer.capabilities.getExtension('OES_texture_half_float');
    const dataType = supportsHalfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;

    new RGBELoader()
        .setDataType(dataType)
        .load('texture_sets/studio_small_09_2k.hdr', (hdrTexture) => {
          hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
          scene.environment = hdrTexture;
          scene.background = hdrTexture;
          pmremGenerator.dispose();
        });

    const { robot } = await loadBots();
    // const { arms } = await loadArms();

    // const { arms } = await loadArms({
    //   activeArmCount: gameState.activeArms,
    //   speed: gameState.armSpeed,
    // });
    const { computer } = await loadComputer();
    const { ground } = await loadGround();

    controls.target.copy(robot.position);

    // loop.updatables.push(robot, computer, ground, arms);
    // scene.add(robot, computer, ground, arms);
    loop.updatables.push(robot, computer, ground);
    scene.add(robot, computer, ground);

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
    const rect = renderer.domElement.getBoundingClientRect();
    gameState.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    gameState.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    gameState.raycaster.setFromCamera(gameState.pointer, camera);
    const intersects = gameState.raycaster.intersectObjects(scene.children, true);

    for (const hit of intersects) {
      if (hit.object.name.startsWith('1')) {
        console.log('Profiler clicked');
        this.incrementProgress();
        break;
      }

      if (hit.object.name.startsWith('2')) {
        console.log('Computer clicked');
        const modal = document.getElementById('upgrade-modal');
        if (modal) modal.style.display = 'flex';
        break;
      }
    }
  }

  incrementXp(numFilings) {
    gameState.xp += numFilings;

    if (gameState.xpDisplay) {
      gameState.xpDisplay.textContent = `Experience: ${gameState.xp} / ${gameState.nextXpNeeded}`;
    }

    if (gameState.xp >= gameState.nextXpNeeded) {
      gameState.nextXpNeeded = Math.floor(gameState.nextXpNeeded * gameState.levelIncrementMultiplier);
      gameState.xp = 0;
      gameState.level += 1;

      if (gameState.levelDisplay) {
        gameState.levelDisplay.textContent = `Mastery Level: ${gameState.level}`;
      }
    }
  }

  incrementProgress() {
    const numFilings = gameState.incrementMultiplier;
    gameState.score += numFilings;

    this.incrementXp(numFilings);
    this.incrementFunds(numFilings);

    if (gameState.scoreDisplay) {
      gameState.scoreDisplay.textContent = `${gameState.score}`;
    }

    const labelText = `+${numFilings}`;
    const textSprite = this.createFloatingText(labelText, new THREE.Vector3(1, 2, 2));

    scene.add(textSprite);
    loop.updatables.push(textSprite);
  }

  createFloatingText(text, position) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '85px Helvetica';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new SpriteMaterial({ map: texture, transparent: true });
    const sprite = new Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(1.5, 0.75, 1.5);

    const driftX = (Math.random() - 0.5) * 0.5;
    const driftZ = (Math.random() - 0.5) * 0.5;

    let life = 0;
    sprite.tick = (delta) => {
      sprite.position.y += delta * 1.8;
      sprite.position.x += driftX * delta;
      sprite.position.z += driftZ * delta;
      material.opacity -= delta * 0.8;
      life += delta;
      if (life > 0.9) {
        scene.remove(sprite);
        loop.updatables = loop.updatables.filter((item) => item !== sprite);
      }
    };

    return sprite;
  }

  incrementFunds(numFilings) {
    gameState.funds += gameState.amountPerFiling * numFilings;

    if (gameState.fundsDisplay) {
      gameState.fundsDisplay.textContent = `$${gameState.funds}`;
    }
  }
}

export { World };
