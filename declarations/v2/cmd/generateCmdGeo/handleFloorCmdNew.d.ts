import type { INodeInfo, IRoomArchi } from '../../interfaces/IGetArchi';
import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import type { IFloorData } from '../../interfaces/IFloorData';
import type { ISkipItem } from '../../interfaces/ISkipItem';
import type { ICmdNew } from '../../interfaces/ICmdNew';
export declare function handleFloorCmdNew(floorData: IFloorData, buildingNode: SpinalNode, bimFileId: string, dataToDo: ICmdNew[][], skipList: ISkipItem[], refContext: SpinalContext): Promise<void>;
export declare function getRoomFromRefByName(refContext: SpinalContext, name: string): Promise<SpinalNode<any>>;
export declare function getRoomCmd(roomArchi: IRoomArchi, pNId: string, bimFileId: string, roomCmds: ICmdNew[], roomRefCmds: ICmdNew[], refContext: SpinalContext): Promise<void>;
export declare function getRefCmd(properties: INodeInfo, pNId: string, type: string, bimFileId: string): ICmdNew;
