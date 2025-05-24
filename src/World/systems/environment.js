import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export async function loadHDRI(renderer, hdrURL) {
//   const hdrTex = await new RGBELoader().loadAsync(hdrURL);
//   hdrTex.mapping = THREE.EquirectangularReflectionMapping;
//
//   const pmrem = new THREE.PMREMGenerator(renderer);
//   const envRT = pmrem.fromEquirectangular(hdrTex);
//   pmrem.compileEquirectangularShader();
//
//   hdrTex.dispose();
//   return envRT.texture;
}
