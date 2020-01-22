export declare const CONTEXT_NAME: string;
export declare const SPATIAL_START_NODE_RELATION_NAME: string;
export declare const SPATIAL_RELATION_NAME: string;
export declare const SPATIAL_START_NODE_NAME: string;
export declare class InvalidObjectManager {
    private context;
    contextId: string;
    private spatialStartNode;
    private readonly initialized;
    constructor();
    addObject(nodeId: any): Promise<import("spinal-model-graph/declarations/src/Nodes/SpinalNode").SpinalNode<any>>;
    private init;
    private getSpatialStartNode;
    private static getContext;
    private static createContext;
}
