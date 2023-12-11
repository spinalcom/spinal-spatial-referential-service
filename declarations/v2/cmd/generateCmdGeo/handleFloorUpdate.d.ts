import type { SpinalContext } from 'spinal-model-graph';
import type { IFloorData } from '../../interfaces/IFloorData';
import type { ISkipItem } from '../../interfaces/ISkipItem';
import type { ICmdNewDelete, ICmdNewRef, ICmdNewRefNode, ICmdNewSpace } from '../../interfaces/ICmdNew';
export declare function handleFloorUpdate(floorData: IFloorData, parentNodeId: string, skipList: ISkipItem[], bimFileId: string, refContext: SpinalContext, contextId: string, floors: ICmdNewSpace[], floorRefs: ICmdNewRef[], roomCmds: (ICmdNewSpace | ICmdNewRefNode)[], roomRefCmds: ICmdNewRef[], itemDeletes: ICmdNewDelete[]): Promise<void>;
