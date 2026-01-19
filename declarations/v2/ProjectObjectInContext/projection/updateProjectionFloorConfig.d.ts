import type { SpinalContext } from 'spinal-model-graph';
export declare function updateProjectionFloorConfig(context: SpinalContext, levelsFoundAssigned: {
    bimFileName: string;
    bimFileId: string;
    floorDbId: number;
    targetFloorName: string;
    targetFloorId: number;
}[], spatialLevels: {
    name: string;
    floorId: number;
}[]): Promise<import("../..").ProjectionFloorConfig[]>;
