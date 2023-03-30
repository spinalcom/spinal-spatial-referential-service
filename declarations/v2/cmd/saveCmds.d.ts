import { SpinalNode, SpinalContext } from 'spinal-model-graph';
import { Path } from 'spinal-core-connectorjs';
export declare const GENERATION_CONTEXT_NAME = "Generation Context";
export declare const GENERATION_CONTEXT_TYPE = "GenerationContext";
export declare const GENERATION_TYPE = "GenerationType";
export declare const GENERATION_RELATION = "hasGeneration";
export declare const GENERATION_GEO_TYPE = "ContextSpatial";
export declare function getContextGeneration(): Promise<SpinalContext<any>>;
export declare function saveCmds(json: object, local?: boolean): Promise<{
    node: SpinalNode<Path>;
    data: Path;
}>;
export declare function waitPathSendToHub(path: Path): Promise<void>;
export declare function getCmdServId(node: SpinalNode<Path>): number;
export declare function decode(compressed: Uint8Array): any;
