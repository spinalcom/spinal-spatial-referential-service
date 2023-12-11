import type { SpinalContext } from 'spinal-model-graph';
import type { IFloorData } from '../../interfaces/IFloorData';
import type { ISkipItem } from '../../interfaces/ISkipItem';
import type { ICmdNewRef, ICmdNewSpace } from '../../interfaces/ICmdNew';
export declare function handleFloorCmdNew(floorData: IFloorData, parentNodeId: string, bimFileId: string, skipList: ISkipItem[], refContext: SpinalContext, contextId: string, floors: ICmdNewSpace[], floorRefs: ICmdNewRef[], rooms: ICmdNewSpace[], roomRefs: ICmdNewRef[]): Promise<void>;
