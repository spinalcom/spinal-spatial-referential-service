/// <reference types="forge-viewer" />
import { AbstractEntityManager } from "./AbstractEntityManager";
import { SpinalNodeRef } from "spinal-env-viewer-graph-service";
import Property = Autodesk.Viewing.Property;
export declare class RoomManager extends AbstractEntityManager {
    constructor();
    create(name: string, info: Property[], attributes: string[]): Promise<SpinalNodeRef>;
    getParents(node: any): Promise<any>;
    update(entityId: string, info: Property[]): SpinalNodeRef;
}
