/// <reference types="forge-viewer" />
import Model = Autodesk.Viewing.Model;
import { SpinalNodeRef, SpinalNode } from "spinal-env-viewer-graph-service";
export interface EntityProp {
    propName: string;
    propVal: any;
}
import { SpinalProps } from "../SpatialManager";
export declare abstract class AbstractEntityManager {
    private invalidObjectManager;
    protected constructor();
    /**
     * Create a new entity with the info as SpinalAttribute
     * @param name {string} node of the entity
     * @param info {EntityProp[]}
     * @param attributes {string} properties to add as attribute for the entity
     * return the entity newly created
  
     */
    abstract create(name: string, info: SpinalProps[], attributes: string[]): Promise<SpinalNodeRef>;
    abstract getParents(node: any): SpinalNode;
    /**
     * Update the entity with all the props of info
     * @param entityId {string}
     * @param info {EntityProp[]}
     * @returns return the entity updated
     */
    abstract update(entityId: string, info: SpinalProps[]): SpinalNodeRef;
    /**
     * add a new entity to the parent if the entity is not already present
     * @param contextId {string}
     * @param parentId {string}
     * @param childId {string}
     * @param relationName {string}
     * @param relationType {string}
     */
    addChild(contextId: string, parentId: string, childId: string, relationName: string, relationType: string): Promise<SpinalNodeRef>;
    /**
     * Delete the entity
     * @param entityId {string} id of the entity
     * @returns true if the entity has been deleted false otherwise
     */
    delete(entityId: string): Promise<boolean>;
    addBimObject(contextId: string, parentId: string, dbId: number, objectName: string, model: any): void;
    addReferenceObject(parentId: string, dbId: number, name: string, model: Model): void;
    /**
     * Add all the attribute of $attribute to the node
     * @param node
     * @param attributes
     * @param properties
     */
    addAttribute(node: SpinalNode, attributes: SpinalProps[]): Promise<any[]>;
    /**
     * Get the entity for entityId
     * @param entityId {string} id of the entity
     * @returns  the entity if found undefined otherwise
     */
    get(entityId: string): Promise<SpinalNodeRef>;
    getPropertyValueByName(properties: SpinalProps[], name: string): string;
    getByExternalId(externalId: string, parentId: any, relationName: any): Promise<SpinalNodeRef>;
}
