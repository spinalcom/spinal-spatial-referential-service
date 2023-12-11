import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import type { IFloorArchi, TManualAssingment } from '../interfaces/IGetArchi';
export declare function getFloorFromContext(context: SpinalContext, floorArchi: IFloorArchi, manualAssingment: TManualAssingment, buildingServId: number): Promise<SpinalNode>;
