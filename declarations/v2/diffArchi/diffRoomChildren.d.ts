import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { type IDiffRoomChildren, type IFloorArchi, type TManualAssingment } from '../interfaces/IGetArchi';
export declare function diffRoomChildren(floorNode: SpinalNode, contextGeo: SpinalContext, floorArchi: IFloorArchi, manualAssingment: TManualAssingment): Promise<IDiffRoomChildren>;
