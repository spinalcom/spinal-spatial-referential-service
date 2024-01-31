/// <reference types="forge-viewer" />
/// <reference types="forge-viewer" />
export declare function getBBoxAndMatrix(dbId: number, model: Autodesk.Viewing.Model, viewer: Autodesk.Viewing.Viewer3D): Promise<{
    matrixWorld: THREE.Matrix4;
    bbox: THREE.Box3;
}>;
