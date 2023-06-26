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
  GEO_REFERENCE_RELATION,
  GEO_REFERENCE_ROOM_RELATION,
} from '../../Constant';

function updateDbId(spinalNode: SpinalNode) {
  if (typeof spinalNode.info.dbId !== 'undefined') {
    if (typeof spinalNode.info.dbid === 'undefined') {
      const dbid = spinalNode.info.dbId;
      spinalNode.info.rem_attr('dbId');
      spinalNode.info.add_attr('dbid', dbid);
    } else {
      spinalNode.info.rem_attr('dbId');
    }
  }
}

export async function updateRoomDbId(graph: SpinalGraph): Promise<void> {
  const context = await getContextSpatial(graph);
  const buildings = await context.getChildrenInContext(context);
  for (const building of buildings) {
    const floors = await building.getChildrenInContext(context);
    for (const floor of floors) {
      const [floorRefObjs, rooms] = await Promise.all([
        floor.getChildren(GEO_REFERENCE_RELATION),
        floor.getChildrenInContext(context),
      ]);
      for (const floorRefObj of floorRefObjs) {
        updateDbId(floorRefObj);
      }
      for (const room of rooms) {
        updateDbId(room);
        const refsRoom = await room.getChildren(GEO_REFERENCE_ROOM_RELATION);
        for (const ref of refsRoom) {
          updateDbId(ref);
        }
      }
    }
  }
}
