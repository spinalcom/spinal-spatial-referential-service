import Model = Autodesk.Viewing.Model;
import {
  SPINAL_RELATION_LST_PTR_TYPE,
  SpinalGraphService,
  SpinalNodeRef,
  SpinalNode, SPINAL_RELATION_TYPE,
} from "spinal-env-viewer-graph-service";
import { InvalidObjectManager } from "./InvalidObjectManager";

import { serviceDocumentation }
  from 'spinal-env-viewer-plugin-documentation-service'

export interface EntityProp {
  propName: string,
  propVal: any
}

import GeographicService from 'spinal-env-viewer-context-geographic-service'
import { SpinalProps } from "../SpatialManager";

const InvalidManager = new InvalidObjectManager();

export abstract class AbstractEntityManager {
  private invalidObjectManager: InvalidObjectManager;

  protected constructor() {
    this.invalidObjectManager = new InvalidObjectManager();
  }


  /**
   * Create a new entity with the info as SpinalAttribute
   * @param name {string} node of the entity
   * @param info {EntityProp[]}
   * @param attributes {string} properties to add as attribute for the entity
   * return the entity newly created

   */
  abstract create(name: string, info: SpinalProps[], attributes: string[]): Promise<SpinalNodeRef>;

  abstract getParents(node): SpinalNode;

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
  async addChild(contextId: string, parentId: string, childId: string,
                 relationName: string, relationType: string): Promise<SpinalNodeRef> {

    const parentChild: SpinalNodeRef[] = await SpinalGraphService.getChildren(parentId, [relationName]);
    if (typeof parentChild !== "undefined")
      for (let i = 0; i < parentChild.length; i++) {
        const brother = parentChild[i];
        if (brother.id.get() === childId)
          return brother;
      }
    return SpinalGraphService
      .addChildInContext(parentId, childId, contextId, relationName, relationType)
      .then(node => SpinalGraphService.getNode(node.info.id.get()))
  }

  /**
   * Delete the entity
   * @param entityId {string} id of the entity
   * @returns true if the entity has been deleted false otherwise
   */
  async delete(entityId: string): Promise<boolean> {
    const roomNode = await SpinalGraphService.getNodeAsync(entityId);
    const parent = await this.getParents(roomNode);
    if (typeof parent === "undefined")
      return false;

    const removed = await SpinalGraphService.removeChild(parent.info.id.get(), entityId,
      GeographicService.constants.ROOM_RELATION, SPINAL_RELATION_TYPE);
    await this.invalidObjectManager.addObject(entityId);
    return removed;
  }

  addBimObject(contextId: string, parentId: string, dbId: number, objectName: string, model) {
    // @ts-ignore
    window.spinal.BimObjectService
      .addBIMObject(contextId, parentId, dbId, objectName, model);
  }

  addReferenceObject(parentId: string, dbId: number, name: string, model: Model) {
    // @ts-ignore
    window.spinal.BimObjectService
      .addReferenceObject(parentId, dbId, name, model);
  }

  /**
   * Add all the attribute of $attribute to the node
   * @param node
   * @param attributes
   * @param properties
   */
  async addAttribute(node: SpinalNode, attributes: SpinalProps[],) {
    let proms = [];
    let category = await serviceDocumentation.getCategoryByName(node, 'Spatial');
    if (typeof category === "undefined") {
      category = await serviceDocumentation.addCategoryAttribute(node, 'Spatial')
    }
    for (let i = 0; i < attributes.length; i++) {
      const prop = attributes[i];

      proms.push(serviceDocumentation.addAttributeByCategory(node, category, prop.name, prop.value));
    }
    return Promise.all(proms);
  }

  /**
   * Get the entity for entityId
   * @param entityId {string} id of the entity
   * @returns  the entity if found undefined otherwise
   */
  get(entityId: string): Promise<SpinalNodeRef> {
    return SpinalGraphService.getNodeAsync(entityId);
  }

  getPropertyValueByName(properties: SpinalProps[], name: string): string {
    for (let i = 0; i < properties.length; i++) {
      if (properties[i].name.toLowerCase() === name.toLowerCase())
        return properties[i].value;
    }
    return undefined;
  }

  getByExternalId(externalId: string, parentId, relationName) {
    return SpinalGraphService.getChildren(parentId, [relationName])
      .then(children => {
        if (typeof children === "undefined")
          return undefined;

        for (let i = 0; i < children.length; i++) {
          if (children[i].hasOwnProperty('externalId') && children[i].externalId.get() === externalId)
            return children[i];
        }
        return undefined;
      })
  }
}