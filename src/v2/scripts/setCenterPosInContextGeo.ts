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

import type {
  SpinalContext,
  SpinalGraph,
  SpinalNode,
} from 'spinal-model-graph';
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
import { getWorldBoundingBox } from '../utils/getWorldBoundingBox';
import { getModelByBimFileIdLoaded } from '../utils';

export async function setCenterPosInContextGeoByFloors(
  contextGeo: SpinalContext,
  floorNodes: SpinalNode[],
  cb: (msg: string) => void
): Promise<void> {
  const roomNodes: SpinalNode[] = [];
  cb(`0/3 room progress: loading rooms from floors`);
  for (const floorNode of floorNodes) {
    const rooms = await floorNode.getChildrenInContext(contextGeo);
    roomNodes.push(...rooms);
  }
  await processRoomNodesCenterPos(roomNodes, contextGeo, cb);
}

export async function setCenterPosInContextGeo(
  graph: SpinalGraph,
  cb: (msg: string) => void
): Promise<void> {
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
  await processRoomNodesCenterPos(roomNodes, context, cb);
}

async function processRoomNodesCenterPos(
  roomNodes: SpinalNode<any>[],
  context: SpinalContext<any>,
  cb: (msg: string) => void
) {
  const roomArrProm = [];
  roomNodes.forEach((roomNode) => {
    roomArrProm.push(() => updateRoomPos(roomNode));
  });
  await consumeBatch(roomArrProm, 20, (i, total) =>
    cb(`1/3 room progress: ${i}/${total}`)
  );
  const bimobjArrProm = [];
  const roomArrProm2 = roomNodes.map(
    (roomNode) => () => updateBimObj(roomNode, context, bimobjArrProm)
  );

  await consumeBatch(roomArrProm2, 20, (i, total) =>
    cb(`2/3 load bimObj progress: ${i}/${total}`)
  );

  await consumeBatch(bimobjArrProm, 20, (i, total) =>
    cb(`3/3 bimObj update progress: ${i}/${total}`)
  );
  cb(`done`);
}

async function updateRoomPos(roomNode: SpinalNode): Promise<void> {
  const roomRefs = await roomNode.getChildren(GEO_REFERENCE_ROOM_RELATION);
  let roomBbox: THREE.Box3 = null;
  for (const roomRef of roomRefs) {
    if (roomRef.info.dbid.get() > 0) {
      // get autodesk Model
      const model = getModelByBimFileIdLoaded(roomRef.info.bimFileId.get());
      if (!model) {
        console.log(`${roomNode.info.name.get()}} skipped : model not loaded`);
        continue;
      }
      try {
        const fragIds = await getFragIds(roomRef.info.dbid.get(), model);
        const bbox = getWorldBoundingBox(fragIds, model);
        if (!roomBbox) roomBbox = bbox;
        else roomBbox.union(bbox);
      } catch (e) {
        console.error(e);
      }
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
  const label = 'XYZ center';
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

async function updateBimObj(
  roomNode: SpinalNode,
  context: SpinalContext,
  res: (() => Promise<void>)[]
) {
  const bimObjs = await roomNode.getChildrenInContext(context);
  for (const bimObj of bimObjs) {
    res.push(async () => {
      const model = getModelByBimFileIdLoaded(bimObj.info.bimFileId.get());
      if (!model) {
        console.log(
          `${roomNode.info.name.get()}/${bimObj.info.name.get()} skipped : model not loaded`
        );
        return;
      }
      try {
        const fragIds = await getFragIds(bimObj.info.dbid.get(), model);
        const bbox = getWorldBoundingBox(fragIds, model);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        const attr = await getCenterPosAttr(bimObj);
        const str = `${center.x};${center.y};${center.z}`;
        attr.value.set(str);
      } catch (e) {
        console.error(e);
      }
    });
  }
}
