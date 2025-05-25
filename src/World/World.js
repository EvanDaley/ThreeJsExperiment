import * as THREE from 'three';

import { gameState } from './state/gameState.js';

import { createFloatingText } from './utils/createFloatingText.js';

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

let camera, renderer, scene, loop, controls, ground, container, resizer;

class World {
  constructor(targetElement) {
    container = targetElement;

    this.tapHintInterval = null;
    this.tapHintStopped = false;

    this.createResponsiveScene();
    this.createLights();
    this.createGameSystems();
    this.createSceneObjects();
    this.createParticleSystems();

    bindUI(gameState);

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
    ground = null;
  }

  createParticleSystems() {
    const backgroundParticles = createBackgroundParticles();
    scene.add(backgroundParticles);
    loop.updatables.push(backgroundParticles);
  }

  async init() {
    await loadHDRIEnvironment(renderer, scene);

    const { robot } = await loadBots();
    const { arms } = await loadArms({
      activeArmCount: gameState.activeArms,
      speed: gameState.armSpeed,
    });
    const { computer } = await loadComputer();
    const { ground } = await loadGround();

    this.upgradeManager = new UpgradeManager({ gameState, arms });

    controls.target.copy(robot.position);
    loop.updatables.push(robot, computer, ground, arms);
    scene.add(robot, computer, ground, arms);
    resizer.onResize();
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
    if (this.tapHintStopped) return;

    this.tapHintInterval = setInterval(() => {
      if (gameState.score < 3) {
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
    const textSprite = createFloatingText(labelText, new THREE.Vector3(1, 2, 2), loop, scene);
    scene.add(textSprite);
    loop.updatables.push(textSprite);
  }

  createTapHint() {
    const labelText = `TAP THE ROBOT`;
    const textSprite = createFloatingText(
        labelText,
        new THREE.Vector3(1, 2, 2),
        loop,
        scene,
        0.2,
        70,
        3
    );
    scene.add(textSprite);
    loop.updatables.push(textSprite);
  }

  incrementFunds(numFilings) {
    gameState.funds += gameState.amountPerFiling * numFilings;

    if (gameState.fundsDisplay) {
      gameState.fundsDisplay.textContent = `$${gameState.funds}`;
    }
  }
}

export { World };
