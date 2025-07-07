// vertexColorUtils.js
import { Color, BufferAttribute } from 'three';

function applyVertexColorsToGeometry(geometry) {
    const position = geometry.attributes.position;
    const count = position.count;

    const colors = new Float32Array(count * 3);
    const color = new Color();

    for (let i = 0; i < count; i++) {
        const y = position.getY(i);

        // You can customize the gradient logic here
        color.setHSL((y + 1) / 2, 1.0, 0.5); // gradient based on height
        color.toArray(colors, i * 3);
    }

    geometry.setAttribute('color', new BufferAttribute(colors, 3));
}

export { applyVertexColorsToGeometry };
