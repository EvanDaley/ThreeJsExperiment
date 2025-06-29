import * as THREE from 'three';

import { gameState } from './state/gameState.js';

import { spawnFloatingText } from './utils/FloatingTextManager.js';

import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';
import { loadBots } from './components/bots/bots.js';
import { loadArms } from './components/arms/arms.js';
import { loadComputer } from './components/computer/computer.js';
import { loadGround } from './components/ground/ground.js';
import { createBackgroundParticles } from './components/particles';

import { createControls } from './systems/controls.js';
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { UpgradeManager } from './systems/UpgradeManager.js';
import { bindUI } from './systems/UIBinder.js';
import { loadHDRIEnvironment } from './systems/environment.js';
import { initEnvelopePool, animateEnvelope } from './utils/EnvelopeAnimator.js';
import { SaveManager } from './systems/SaveManager.js';

let camera, renderer, scene, loop, controls, ground, container, resizer;

document.devMode = true;

class World {
  constructor(targetElement) {
    container = targetElement;

    this.tapHintInterval = null;
    this.tapHintStopped = false;

    this.createResponsiveScene();
    this.createLights();
    this.createGameSystems();
    this.createSceneObjects();
    // this.createParticleSystems();

    bindUI(gameState);

    this.setupGameLoop();
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
    ground = null;
  }

  createParticleSystems() {
    const backgroundParticles = createBackgroundParticles();
    scene.add(backgroundParticles);
    loop.updatables.push(backgroundParticles);
  }

  setupGameLoop() {
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

  async init() {
    initEnvelopePool(scene);
    resizer.onResize();

    const assets = await this.loadAssets();


    this.upgradeManager = new UpgradeManager({
      gameState,
      arms: assets.arms,
    });

    SaveManager.load(gameState, this.upgradeManager);
    // console.log('loaded')
    // console.log(JSON.stringify(gameState))

    // Refresh arm state after loading
    assets.arms.updateArmVisibility(gameState.activeArms);
    assets.arms.updateSpeed(gameState.armSpeed);

    this.upgradeManager.renderUpgrades()

    this.incrementProgress()


    controls.target.copy(assets.robot.position);
    loop.updatables.push(assets.robot, assets.computer, assets.ground, assets.arms);
    scene.add(assets.robot, assets.computer, assets.ground, assets.arms);
    await loadHDRIEnvironment(renderer, scene);

    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'none';

    this.showStartModal();
  }

  showStartModal() {
    const modal = document.getElementById('start-modal');
    const input = document.getElementById('player-name');
    const button = document.getElementById('start-button');
    modal.style.display = 'flex';
    input.focus();

    button.addEventListener('click', () => {
      const name = input.value.trim();
      if (name) {
        gameState.playerName = name;
        modal.style.display = 'none';
        this.start(); // start game loop once name is set
      }
    });

    // Skip start menu if we are in dev mode
    console.log(document.devMode)
    if (document.devMode) {
      modal.style.display = 'none';
      this.start(); // start game loop once name is set

    }

  }

  async loadAssets() {
    const { robot } = await loadBots();
    this.robot = robot;

    const { arms } = await loadArms({
      activeArmCount: gameState.activeArms,
      speed: gameState.armSpeed,
      onSwingComplete: () => this.incrementProgress(),
    });
    arms.updateArmVisibility(gameState.activeArms);
    arms.updateSpeed(gameState.armSpeed);

    const { computer } = await loadComputer();
    const { ground } = await loadGround();

    return { robot, arms, computer, ground };
  }

  render() {
    renderer.render(scene, camera);
  }

  start() {
    loop.start();
    this.startTapHintLoop();
  }

  stop() {
    loop.stop();
    clearInterval(this.tapHintInterval);
  }

  startTapHintLoop() {
    if (this.tapHintStopped || gameState.score > 6) return;
    this.createTapHint();

    this.tapHintInterval = setInterval(() => {
      if (gameState.score < 6) {
        this.createTapHint();
      } else {
        clearInterval(this.tapHintInterval);
        this.tapHintStopped = true;
      }
    }, 2000);
  }

  onPointerDown(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    gameState.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    gameState.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    gameState.raycaster.setFromCamera(gameState.pointer, camera);
    const intersects = gameState.raycaster.intersectObjects(scene.children, true);

    for (const hit of intersects) {
      if (hit.object.name.startsWith('2')) {
        this.upgradeManager.showModal();
        break;
      }

      if (hit.object.name.startsWith('1')) {
        this.incrementProgress();
        break;
      }
    }
  }

  incrementProgress() {
    const numFilings = gameState.incrementMultiplier;
    gameState.score += numFilings;

    this.incrementFunds(numFilings);

    this.robot.triggerHeadBounce();

    if (gameState.scoreDisplay) {
      gameState.scoreDisplay.textContent = `${gameState.score}`;
    }

    spawnFloatingText({
      label: `+${numFilings}`,
      loop,
      scene,
    });

    animateEnvelope({
      start: new THREE.Vector3(1.1, -1, 3.5),
      end: new THREE.Vector3(-.9, -1.5, 3.5),
      arcHeight: 2.8,
      duration: 1
    });
  }

  createTapHint() {
    spawnFloatingText({
      label: `TAP THE ROBOT`,
      loop,
      scene,
      scale: 0.2,
      maxSize: 70,
      duration: 3,
    });
  }

  incrementFunds(numFilings) {
    gameState.funds += gameState.amountPerFiling * numFilings;

    if (gameState.fundsDisplay) {
      gameState.fundsDisplay.textContent = `$${gameState.funds}`;
    }
  }
}

export { World };
