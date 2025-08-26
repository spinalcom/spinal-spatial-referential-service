import type { SpinalContext } from 'spinal-model-graph';
import type { IFloorOnlyItem } from './getArchiFloorOnly';
import type { ICmdNew } from '../interfaces';
export declare function createCmdFloorOnlyImport(bimGeoContext: SpinalContext, floorOnlyItems: IFloorOnlyItem[], bimFileId: string): Promise<ICmdNew[][]>;
