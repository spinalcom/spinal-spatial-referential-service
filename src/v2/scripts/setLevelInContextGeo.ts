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
// // uncomment to add Attr to refobjs
// import {
//   GEO_REFERENCE_RELATION,
//   GEO_REFERENCE_ROOM_RELATION,
// } from '../../Constant';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { Val } from 'spinal-core-connectorjs_type';

async function setLevelAttr(node: SpinalNode, value: string) {
  const categoryName = 'Spatial';
  const label = 'level';
  let category = await attributeService.getCategoryByName(node, categoryName);
  if (!category) {
    category = await attributeService.addCategoryAttribute(node, categoryName);
  }
  const attrs = await attributeService.getAttributesByCategory(node, category);
  for (const attr of attrs) {
    if (attr.label.get() === label) {
      if (attr.value instanceof Val) {
        attr.mod_attr('value', value);
      } else attr.value.set(value);
      return;
    }
  }
  attributeService.addAttributeByCategory(node, category, label, value);
}

export async function setLevelInContextGeo(graph: SpinalGraph) {
  const context = await getContextSpatial(graph);
  const buildings = await context.getChildrenInContext(context);
  for (const building of buildings) {
    const floors = await building.getChildrenInContext(context);
    for (const floor of floors) {
      const rooms = await floor.getChildrenInContext(context);
      // // uncomment to add Attr to refobjs
      // const [floorRefObjs, rooms] = await Promise.all([
      //   floor.getChildren(GEO_REFERENCE_RELATION),
      //   floor.getChildrenInContext(context),
      // ]);
      const floorName = floor.info.name.get();
      const proms = [];
      // // uncomment to add Attr to refobjs
      // for (const floorRefObj of floorRefObjs) {
      //   proms.push(setLevelAttr(floorRefObj, floorName));
      // }

      for (const room of rooms) {
        proms.push(setLevelAttr(room, floorName));
        // // uncomment to add Attr to refobjs
        // const refsRoom = await room.getChildren(GEO_REFERENCE_ROOM_RELATION);
        // for (const ref of refsRoom) {
        //   proms.push(setLevelAttr(ref, floorName));
        // }
      }
      await Promise.all(proms);
    }
  }
}
