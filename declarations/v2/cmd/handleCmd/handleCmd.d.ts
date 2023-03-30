import type { ICmdNew } from '../../interfaces/ICmdNew';
import { SpinalNode } from 'spinal-model-graph';
export declare function handleCmd(cmds: ICmdNew[][], name: string, callbackProg?: (indexCmd: number, idxInCmd: number) => void): Promise<void>;
export declare function getBimFileByBimFileId(bimFileId: string): Promise<SpinalNode>;
