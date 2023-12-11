import type { IFloorArchi, IGetArchi, TManualAssingment } from '../interfaces';
import { SpinalContext } from 'spinal-model-graph';
export declare function mergeManualAssignArchiFloor(archiData: IGetArchi, manualAssingment: TManualAssingment, context: SpinalContext, buildingServerId?: number): Promise<IFloorArchi[]>;
