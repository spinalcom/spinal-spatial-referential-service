/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

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
import { SpinalProps } from "../SpatialManager";

export class RoomManager extends AbstractEntityManager {

  constructor() {
    super();
  }

  async create(name: string, info: any[], attributes: SpinalProps[])
    : Promise<SpinalNodeRef> {
    const roomId = SpinalGraphService.createNode({
      name: name,
      type: GeographicService.constants.ROOM_TYPE
    }, new AbstractElement(name));

    await this.addAttribute(SpinalGraphService.getRealNode(roomId), attributes);
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
