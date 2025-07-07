import {
    PlaneGeometry,
    Mesh,
    Color,
    BufferAttribute,
    MeshBasicMaterial,
    Group,
} from 'three';

function createGradientPlane(width, height, axis = 'z', colorTop, colorBottom) {
    const geometry = new PlaneGeometry(width, height, 50, 50);

    // Rotate based on axis
    if (axis === 'z') {
        geometry.rotateX(-Math.PI / 2); // ground
    } else if (axis === 'y') {
        geometry.rotateY(Math.PI); // back wall facing camera
    }

    const position = geometry.attributes.position;
    const count = position.count;
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const val = axis === 'z'
            ? position.getZ(i)
            : position.getY(i);
        const range = axis === 'z' ? height : height;
        const t = (val + range / 2) / range;
        const color = colorBottom.clone().lerp(colorTop, t);
        color.toArray(colors, i * 3);
    }

    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    const material = new MeshBasicMaterial({
        vertexColors: true,
        side: 2,
    });

    return new Mesh(geometry, material);
}

async function loadGround() {
    const group = new Group();

   // Ground
    const GROUND_TOP_COLOR = new Color('#10c4a8');   // soft sage
    const GROUND_BOTTOM_COLOR = new Color('#e2f7e1'); // minty base

    // Wall
    const WALL_TOP_COLOR = new Color('#18b6ff');     // soft lavender
    const WALL_BOTTOM_COLOR = new Color('#f0eaff');  // powdery off-white

    const ground = createGradientPlane(
        20,
        12,
        'z',
        GROUND_TOP_COLOR,
        GROUND_BOTTOM_COLOR
    );
    ground.position.set(0, -2.5, 1);
    group.add(ground);

// 🟪 Back Wall
    const wall = createGradientPlane(
        20,
        10,
        'y',
        WALL_TOP_COLOR,
        WALL_BOTTOM_COLOR
    );



    wall.position.set(0, 2.5, -3.5); // Raise wall vertically, push back in Z
    group.add(wall);

    return { ground: group };
}

export { loadGround };
