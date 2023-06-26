import type { SpinalNode } from 'spinal-model-graph';
import type { IDiffBimObj, IFloorArchi, TManualAssingment } from '../interfaces/IGetArchi';
export declare function getDiffRefFloor(floorNode: SpinalNode, floorArchi: IFloorArchi, manualAssingment: TManualAssingment): Promise<IDiffBimObj>;
