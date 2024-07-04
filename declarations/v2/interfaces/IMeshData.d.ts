import type { IMeshGeometry } from './IMeshGeometry';
export interface IMeshData {
    geometry: IMeshGeometry;
    matrixWorld: THREE.Matrix4;
    center: THREE.Vector3;
    bbox: THREE.Box3;
}
