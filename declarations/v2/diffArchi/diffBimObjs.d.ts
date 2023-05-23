import type { SpinalNode } from 'spinal-model-graph';
import { type IDiffBimObj, type INodeInfo, type TManualAssingment } from '../interfaces/IGetArchi';
export declare function diffBimObjs(bimObjInfos: INodeInfo[], bimObjNodes: SpinalNode[], manualAssingment: TManualAssingment): IDiffBimObj;
