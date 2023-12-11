import type { IRoomArchi } from '../../interfaces/IGetArchi';
import type { SpinalContext } from 'spinal-model-graph';
import type { ICmdNew } from '../../interfaces/ICmdNew';
export declare function getRoomCmd(roomArchi: IRoomArchi, pNId: string, bimFileId: string, roomCmds: ICmdNew[], roomRefCmds: ICmdNew[], refContext: SpinalContext, contextId: string): Promise<void>;
