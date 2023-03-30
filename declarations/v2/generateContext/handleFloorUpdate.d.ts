import type { SpinalNode } from 'spinal-model-graph';
import type { IFloorData } from '../interfaces/IFloorData';
import type { ISkipItem } from '../interfaces/ISkipItem';
import type { ICmdNew } from '../interfaces/ICmdNew';
export declare function handleFloorUpdate(floorData: IFloorData, buildingNode: SpinalNode, dataToDo: ICmdNew[][], skipList: ISkipItem[], bimFileId: string): Promise<void>;
