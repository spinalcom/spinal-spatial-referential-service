/// <reference types="forge-viewer" />
import { AbstractEntityManager } from "./AbstractEntityManager";
import { SpinalNodeRef } from "spinal-env-viewer-graph-service";
export declare class FloorManager extends AbstractEntityManager {
    constructor();
    create(name: string, info: Autodesk.Viewing.Property[], attributes: string[]): Promise<SpinalNodeRef>;
    getParents(node: any): Promise<any>;
    update(entityId: string, info: Autodesk.Viewing.Property[]): SpinalNodeRef;
}
