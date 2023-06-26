import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import type { IFloorArchi, TManualAssingment } from '../interfaces/IGetArchi';
export declare function getFloorFromContext(contextGeo: SpinalContext, buildingServId: number, floorArchi: IFloorArchi, manualAssingment: TManualAssingment): Promise<SpinalNode>;
