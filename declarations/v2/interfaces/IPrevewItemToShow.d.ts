export interface IPrevewItemToShow {
    dbId: number;
    modelId: number;
    sphere?: THREE.Mesh;
    line?: THREE.Line;
    matrixWorld?: THREE.Matrix4;
    bbox?: THREE.Box3;
    meshs?: THREE.Mesh;
}
