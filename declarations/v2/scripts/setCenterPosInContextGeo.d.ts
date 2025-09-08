import type { SpinalContext, SpinalGraph, SpinalNode } from 'spinal-model-graph';
export declare function setCenterPosInContextGeoByFloors(contextGeo: SpinalContext, floorNodes: SpinalNode[], cb: (msg: string) => void): Promise<void>;
export declare function setCenterPosInContextGeo(graph: SpinalGraph, cb: (msg: string) => void): Promise<void>;
