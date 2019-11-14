import { AbstractEntityManager } from "./AbstractEntityManager";
import {
  SpinalGraphService,
  SpinalNodeRef,
  SPINAL_RELATION_TYPE
} from "spinal-env-viewer-graph-service";
import {
  AbstractElement
} from "spinal-models-building-elements";
import GeographicService from 'spinal-env-viewer-context-geographic-service'
import Property = Autodesk.Viewing.Property;

export class RoomManager extends AbstractEntityManager {

  constructor() {
    super();
  }

  async create(name: string, info: Property[], attributes: string[]): Promise<SpinalNodeRef> {
    const roomId = SpinalGraphService.createNode({
      name: name,
      type: GeographicService.constants.ROOM_TYPE
    }, new AbstractElement(name));

    await this.addAttribute(SpinalGraphService.getRealNode(roomId), attributes, info);
    return SpinalGraphService.getNode(roomId);
  }


  async getParents(node) {
    let parents = await node.getParents();
    for (let i = 0; i < parents.length; i++) {
      if (parents[i].info.type.get() === GeographicService.constants.FLOOR_TYPE)
        return parents[i];
    }
    return undefined;
  }

  update(entityId: string, info: Property[]): SpinalNodeRef {
    return undefined;
  }

}