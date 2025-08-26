import { AbstractEntityManager } from "./AbstractEntityManager";
import { SpinalNodeRef } from "spinal-env-viewer-graph-service";
import { SpinalProps } from "../SpatialManager";
export declare class FloorManager extends AbstractEntityManager {
    constructor();
    create(name: string, info: any[], attributes: SpinalProps[]): Promise<SpinalNodeRef>;
    getParents(node: any): Promise<any>;
    update(entityId: string, info: Autodesk.Viewing.Property[]): SpinalNodeRef;
}
