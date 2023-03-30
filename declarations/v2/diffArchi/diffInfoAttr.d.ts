import type { SpinalNode } from 'spinal-model-graph';
import { IDiffNodeInfoAttr, INodeInfo } from '../interfaces/IGetArchi';
export declare function diffInfoAttr(nodeInfo: INodeInfo, spinalNode: SpinalNode): Promise<IDiffNodeInfoAttr>;
