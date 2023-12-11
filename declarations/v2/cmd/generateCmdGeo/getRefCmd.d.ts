import type { INodeInfo } from '../../interfaces/IGetArchi';
import type { ICmdNewRef } from '../../interfaces/ICmdNew';
export declare function getRefCmd(properties: INodeInfo, pNId: string, type: 'floorRef' | 'roomRef', bimFileId: string): ICmdNewRef;
