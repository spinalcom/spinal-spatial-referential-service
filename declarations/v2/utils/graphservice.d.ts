import { SpinalNodeRef } from 'spinal-env-viewer-graph-service';
import { SpinalGraph, SpinalNode } from 'spinal-model-graph';
export declare function addNodeGraphService(node: SpinalNode): void;
export declare function getGraph(): SpinalGraph;
export declare function getRealNode(nodeId: string): SpinalNode;
export declare function getInfoGraphService(nodeId: string): SpinalNodeRef;
