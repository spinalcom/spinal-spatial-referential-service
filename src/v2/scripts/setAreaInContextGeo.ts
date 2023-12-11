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
  SpinalGraph,
  SpinalContext,
  SpinalNode,
} from 'spinal-model-graph';
import { getContextSpatial } from '../utils/getContextSpatial';
import { GEO_REFERENCE_ROOM_RELATION } from '../../Constant';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { Val } from 'spinal-core-connectorjs';
import { updateLoadedModel } from '../utils/archi/updateLoadedModel';
import { getModelByBimFileId } from '../utils/getModelByBimFileId';
import { getADModelProps } from '../utils/archi/getADModelProps';
import { getADPropBylabel } from '../utils/archi/getADPropBylabel';

async function getAreaAttr(node: SpinalNode) {
  const categoryName = 'Spatial';
  const label = 'area';
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
  return attributeService.addAttributeByCategory(node, category, label, '0');
}

async function updateRoomArea(
  room: SpinalNode,
  loadedModel: Map<string, Promise<Autodesk.Viewing.Model>>
) {
  const roomProp = await getAreaAttr(room);
  const refsRoom = await room.getChildren(GEO_REFERENCE_ROOM_RELATION);
  const proms: Promise<string>[] = [];
  for (const refRoom of refsRoom) {
    proms.push(getADAreaProp(refRoom, loadedModel));
  }
  const refsArea = await Promise.all(proms);

  const roomArea = refsArea.reduce((acc, itm) => {
    return acc + parseFloat(itm);
  }, 0);

  roomProp.value.set(roomArea.toFixed(2));
  return roomProp;
}

async function getADAreaProp(
  refRoom: SpinalNode,
  loadedModel: Map<string, Promise<Autodesk.Viewing.Model>>
): Promise<string> {
  try {
    const dbid = refRoom.info.dbid?.get();
    if (dbid && dbid > 0) {
      const model = await getModelByBimFileId(
        refRoom.info.bimFileId.get(),
        loadedModel
      );
      const refProps = await getADModelProps(model, dbid);
      const refADProp = getADPropBylabel(refProps, 'Area');
      return refADProp?.displayValue?.toString() || '0';
    }
    return '0';
  } catch (error) {
    return '0';
  }
}

async function updateFloorArea(
  floor: SpinalNode,
  context: SpinalContext,
  loadedModel: Map<string, Promise<Autodesk.Viewing.Model>>
) {
  const proms: ReturnType<typeof getAreaAttr>[] = [];
  proms.push(getAreaAttr(floor));
  const rooms = await floor.getChildrenInContext(context);
  for (const room of rooms) {
    proms.push(updateRoomArea(room, loadedModel));
  }
  const [floorProp, ...roomProps] = await Promise.all(proms);
  const floorArea = roomProps.reduce((acc, itm) => {
    return acc + parseFloat(itm.value.get() as string);
  }, 0);
  floorProp.value.set(floorArea.toFixed(2));
  return floorProp;
}

export async function setAreaInContextGeo(graph: SpinalGraph): Promise<void> {
  const loadedModel = new Map<string, Promise<Autodesk.Viewing.Model>>();
  updateLoadedModel(loadedModel);

  const context = await getContextSpatial(graph);
  const buildings = await context.getChildrenInContext(context);

  for (const building of buildings) {
    const proms: ReturnType<typeof getAreaAttr>[] = [];
    proms.push(getAreaAttr(building));
    const floors = await building.getChildrenInContext(context);
    for (const floor of floors) {
      proms.push(updateFloorArea(floor, context, loadedModel));
    }
    const [buildingProp, ...floorProps] = await Promise.all(proms);
    const buildingArea = floorProps.reduce((acc, itm) => {
      return acc + parseFloat(itm.value.get() as string);
    }, 0);
    buildingProp.value.set(buildingArea.toFixed(2));
  }
}
