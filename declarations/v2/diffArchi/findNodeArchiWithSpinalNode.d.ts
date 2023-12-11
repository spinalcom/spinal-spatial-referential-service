import type { SpinalNode } from 'spinal-model-graph';
import type { INodeInfo, TManualAssingment } from '../interfaces/IGetArchi';
export declare function findNodeArchiWithSpinalNode(node: SpinalNode, nodeInfosArchi: INodeInfo[], manualAssingment: TManualAssingment): Promise<INodeInfo>;
