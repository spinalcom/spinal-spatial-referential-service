import type { IMeshGeometry } from '../../interfaces/IMeshGeometry';
import * as THREE from 'three';
export declare function enumMeshTriangles(geometry: IMeshGeometry, callback: (vA: THREE.Vector3, vB: THREE.Vector3, vC: THREE.Vector3, a?: number, b?: number, c?: number, nA?: THREE.Vector3, nB?: THREE.Vector3, nC?: THREE.Vector3) => void): void;
