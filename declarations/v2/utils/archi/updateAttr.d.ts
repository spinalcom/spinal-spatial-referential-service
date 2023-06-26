import type { ICmdNewAttr } from '../../interfaces/ICmdNew';
import type { SpinalNode } from 'spinal-model-graph';
export declare function updateAttr(node: SpinalNode, attrs: ICmdNewAttr[]): Promise<void>;
