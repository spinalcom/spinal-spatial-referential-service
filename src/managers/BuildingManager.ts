import { AbstractEntityManager } from "./AbstractEntityManager";
import {
  SpinalGraphService,
  SpinalNodeRef
} from "spinal-env-viewer-graph-service";
import GeographicService from 'spinal-env-viewer-context-geographic-service'
import {
  AbstractElement
} from "spinal-models-building-elements";

export class BuildingManager extends AbstractEntityManager {

  constructor() {
    super();
  }

  async create(name: string, info: Autodesk.Viewing.Property[], attributes: string[]): Promise<SpinalNodeRef> {
    let nodeId = SpinalGraphService.createNode({
      name: name,
      type: GeographicService.constants.BUILDING_TYPE
    }, new AbstractElement(name));
    await this.addAttribute(SpinalGraphService.getRealNode(nodeId), attributes, info );
    return SpinalGraphService.getNode(nodeId)
  }

  async getParents(node) {
    let parents = await node.getParents();
    for (let i = 0; i < parents.length; i++) {
      if (parents[i].info.type.get() === GeographicService.constants.CONTEXT_TYPE)
        return parents[i];
    }
    return undefined;
  }

  update(entityId: string, info: Autodesk.Viewing.Property[]): SpinalNodeRef {
    return undefined;
  }

}