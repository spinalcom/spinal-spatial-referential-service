import type { SpinalNode } from 'spinal-model-graph';
import { type IDiffNodeInfoAttr, type INodeInfo } from '../interfaces/IGetArchi';
export declare function diffInfoAttr(nodeInfo: INodeInfo, spinalNode: SpinalNode): Promise<IDiffNodeInfoAttr>;
