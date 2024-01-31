/// <reference types="forge-viewer" />
export interface IMeshGeometry {
    vb: Float32Array;
    vblayout: any;
    attributes: {
        index: THREE.BufferAttribute;
        normal: THREE.BufferAttribute;
        position: THREE.BufferAttribute;
        uv: THREE.BufferAttribute;
    };
    ib: Uint16Array;
    indices: any;
    index: THREE.BufferAttribute;
    offsets: any;
    vbstride: number;
}
