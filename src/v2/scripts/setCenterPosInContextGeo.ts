/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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

import type { SpinalGraph, SpinalNode } from 'spinal-model-graph';
import { getContextSpatial } from '../utils/getContextSpatial';
import {
  GEO_SITE_RELATION,
  GEO_BUILDING_RELATION,
  GEO_FLOOR_RELATION,
  GEO_ZONE_RELATION,
  GEO_ROOM_RELATION,
  GEO_REFERENCE_ROOM_RELATION,
  GEO_ROOM_TYPE,
} from '../../Constant';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { Val } from 'spinal-core-connectorjs';
import { consumeBatch } from '../../utils/consumeBatch';
import { getFragIds } from '../utils/getFragIds';
import { getModelByBimFileId } from '../utils/getModelByBimFileId';
import { getWorldBoundingBox } from '../utils/getWorldBoundingBox';
import { updateLoadedModel } from '../utils/archi/updateLoadedModel';

export async function setCenterPosInContextGeo(
  graph: SpinalGraph
): Promise<void> {
  const loadedModel = new Map<string, Promise<Autodesk.Viewing.Model>>();
  updateLoadedModel(loadedModel);
  const context = await getContextSpatial(graph);
  const relationNames = [
    GEO_SITE_RELATION,
    GEO_BUILDING_RELATION,
    GEO_FLOOR_RELATION,
    GEO_ZONE_RELATION,
    GEO_ROOM_RELATION,
  ];
  const roomNodes = await context.find(relationNames, (node: SpinalNode) => {
    return node.info.type.get() === GEO_ROOM_TYPE;
  });
  const arrProm = [];
  roomNodes.forEach((roomNode) => {
    arrProm.push(() => updateRoomPos(roomNode, loadedModel));
  });
  await consumeBatch(arrProm, 20, console.log.bind(null, 'progress: %d/%d'));
}

async function updateRoomPos(
  roomNode: SpinalNode,
  loadedModel: Map<string, Promise<Autodesk.Viewing.Model>>
): Promise<void> {
  const roomRefs = await roomNode.getChildren(GEO_REFERENCE_ROOM_RELATION);
  let roomBbox: THREE.Box3 = null;
  for (const roomRef of roomRefs) {
    if (roomRef.info.dbid.get() > 0) {
      // get autodesk Model
      const model = await getModelByBimFileId(
        roomRef.info.bimFileId.get(),
        loadedModel
      );
      const fragIds = await getFragIds(roomRef.info.dbid.get(), model);
      const bbox = getWorldBoundingBox(fragIds, model);
      //  // add attributes to all roomRef ??
      // const center = bbox.center();
      // const attrFloor = await getCenterPosAttr(floorRef);
      // attrFloor.set(`${center.x};${center.y};${center.z}`);
      if (!roomBbox) roomBbox = bbox;
      else roomBbox.union(bbox);
    }
  }
  if (roomBbox) {
    const centerRoom = new THREE.Vector3();
    roomBbox.getCenter(centerRoom);
    const attr = await getCenterPosAttr(roomNode);
    attr.value.set(`${centerRoom.x};${centerRoom.y};${centerRoom.z}`);
  }
}
async function getCenterPosAttr(node: SpinalNode) {
  const categoryName = 'Spatial';
  const label = 'centerPos';
  let category = await attributeService.getCategoryByName(node, categoryName);
  if (!category) {
    category = await attributeService.addCategoryAttribute(node, categoryName);
  }
  const attrs = await attributeService.getAttributesByCategory(node, category);
  for (const attr of attrs) {
    if (attr.label.get() === label) {
      if (attr.value instanceof Val) {
        attr.mod_attr('value', attr.value.get().toString());
      }
      return attr;
    }
  }
  return attributeService.addAttributeByCategory(
    node,
    category,
    label,
    '0;0;0'
  );
}
