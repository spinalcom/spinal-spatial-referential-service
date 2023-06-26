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

import type { SpinalNode } from 'spinal-model-graph';
import type { ICmdProjection } from '../../interfaces/ICmdProjection';
import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
import type { IFloorZData } from '../../interfaces/IFloorZData';
import { getRealNode } from '../../utils/graphservice';
import { getModelByModelId } from '../../utils/projection/getModelByModelId';
import { getProperties } from '../../utils/projection/getProperties';
import { getIntersectionRoom } from './getIntersectionRoom';
import { createCmdProjItm } from './createCmdProjItm';
import { getCenterPos } from './getCenterPos';
import { consumeBatch } from '../../../utils/consumeBatch';

export async function createCmdProjection(
  intersects: IRaycastIntersectRes[],
  contextGeoId: string,
  floorsData: Record<string, IFloorZData>
): Promise<ICmdProjection[]> {
  const res: ICmdProjection[] = [];
  const dicoBimObjs: Record<string, SpinalNode[]> = {};
  const proms = [];
  for (const spinalIntersection of intersects) {
    proms.push(() =>
      handleCreateCmd(
        spinalIntersection,
        dicoBimObjs,
        contextGeoId,
        floorsData,
        res
      )
    );
  }
  await consumeBatch(
    proms,
    20,
    console.log.bind(null, 'createCmdProjection %d/%d')
  );
  return res;
}

async function handleCreateCmd(
  spinalIntersection: IRaycastIntersectRes,
  dicoBimObjs: Record<string, SpinalNode[]>,
  contextGeoId: string,
  floorsData: Record<string, IFloorZData>,
  res: ICmdProjection[]
) {
  const bimObjectDbId = spinalIntersection.origin.dbId;
  const bimObjectModel = getModelByModelId(spinalIntersection.origin.modelId);
  const auProp = await getProperties(bimObjectModel, bimObjectDbId);
  const room = await getIntersectionRoom(
    spinalIntersection.intersections.dbId,
    spinalIntersection.intersections.modelId,
    dicoBimObjs,
    contextGeoId
  );
  let flagWarining = false;
  const floor = await getFloorFromRoom(room, contextGeoId);
  if (floor) {
    const floorData = floorsData[floor.info.id.get()];
    if (
      floorData &&
      floorData.distance &&
      spinalIntersection.intersections.distance > floorData.distance
    ) {
      flagWarining = true;
    }
  }
  if (!room) {
    console.error(`createCmdProjection: room not found for ${bimObjectDbId}`);
  } else {
    const centerPos = await getCenterPos(auProp);
    createCmdProjItm(res, auProp, room.info.id.get(), centerPos, flagWarining);
  }
}

async function getFloorFromRoom(room: SpinalNode, contextGeoId: string) {
  const contextGeo = getRealNode(contextGeoId);
  const floors = await room.getParentsInContext(contextGeo);

  for (const floor of floors) {
    return floor;
  }
}
