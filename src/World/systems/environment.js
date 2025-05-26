import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

/**
 * Loads and applies an HDRI environment to the scene.
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {string} path - Path to the .hdr file
 */
export async function loadHDRIEnvironment(renderer, scene, path = 'texture_sets/studio_small_09_2k.hdr') {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const supportsHalfFloat = renderer.capabilities.isWebGL2 || renderer.capabilities.getExtension('OES_texture_half_float');
    const dataType = supportsHalfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;

    return new Promise((resolve, reject) => {
        new RGBELoader()
            .setDataType(dataType)
            .load(path, (hdrTexture) => {
                hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = hdrTexture;
                scene.background = new THREE.Color('#d1eaea');

                pmremGenerator.dispose();
                resolve();
            }, undefined, reject);
    });
}
