import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { Path } from 'spinal-core-connectorjs';
export declare function saveCmds(json: object, generationType: string, local: boolean): Promise<{
    node: SpinalNode<Path>;
    context: SpinalContext;
    data: Path;
}>;
