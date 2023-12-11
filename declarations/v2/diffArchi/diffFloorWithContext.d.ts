import type { SpinalContext } from 'spinal-model-graph';
import { type IDiffFloor, type IFloorArchi, type TManualAssingment } from '../interfaces/IGetArchi';
export declare function diffFloorWithContext(floorArchi: IFloorArchi, context: SpinalContext, manualAssingment: TManualAssingment, buildingServerId?: number): Promise<IDiffFloor>;
