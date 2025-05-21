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
import { Raycaster, Vector2 } from 'three';

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

    // An amount we multiply the previous level's XP requirement by to get to the next level
    this.levelIncrementMultiplier = 1.68;
    this.nextXpNeeded = 5;

    this.score = 0;
    this.xp = 1;
    this.level = 1;
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();

    this.funds = 0;

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
    const { robot } = await loadBots()
    const { computer } = await loadComputer()
    const { ground } = await loadGround()

    // const camTarget = chad.position + (new Vector3(0,-1,0))

    controls.target.copy(robot.position)

    loop.updatables.push(robot)
    loop.updatables.push(computer)
    loop.updatables.push(ground)

    scene.add(robot)
    scene.add(computer)
    scene.add(ground)

    resizer.onResize()
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

    // console.log(intersects);
    for (const hit of intersects) {
      console.log(hit.object.name);
  
      if (hit.object.name == 'Profiler') {
        this.incrementProgress()
        this.incrementXp()
        this.incrementFunds()
        break;
      }
    }
  }

  incrementProgress() {
    this.score += 1;

    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `Filings Completed: ${this.score}`;
    }
  }

  incrementXp() {
    this.xp += 1;

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

  incrementFunds() {
    this.funds += 10;

    if (this.fundsDisplay) {
      this.fundsDisplay.textContent = `Funds: $${this.funds}`;
    }
  }
  
}

export { World };
