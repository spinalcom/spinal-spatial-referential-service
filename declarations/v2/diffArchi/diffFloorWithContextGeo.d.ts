import type { SpinalContext } from 'spinal-model-graph';
import { type IDiffFloor, type IFloorArchi, type TManualAssingment } from '../interfaces/IGetArchi';
export declare function diffFloorWithContextGeo(floorArchi: IFloorArchi, contextGeo: SpinalContext, buildingServerId: number, manualAssingment: TManualAssingment): Promise<IDiffFloor>;
