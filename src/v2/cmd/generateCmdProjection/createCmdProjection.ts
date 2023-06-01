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
import type { AuProps } from '../../interfaces';
import type { ICmdProjection } from '../../interfaces/ICmdProjection';
import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
import type { IFloorZData } from '../../interfaces/IFloorZData';
import { getRealNode } from '../../utils/graphservice';
import { getModelByModelId } from '../../utils/projection/getModelByModelId';
import { getProperties } from '../../utils/projection/getProperties';
import { getCategory } from './getCategory';
import { getIntersectionRoom } from './getIntersectionRoom';
import { getBimFileIdByModelId } from '../../utils/projection/getBimFileIdByModelId';

export async function createCmdProjection(
  intersects: IRaycastIntersectRes[],
  contextGeoId: string,
  floorsData: Record<string, IFloorZData>
): Promise<ICmdProjection[]> {
  const res: ICmdProjection[] = [];
  const dicoBimObjs: Record<string, SpinalNode[]> = {};
  for (const spinalIntersection of intersects) {
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
        spinalIntersection.intersections.distance > floorData.distance
      ) {
        flagWarining = true;
      }
    }
    if (!room) {
      console.error(`createCmdProjection: room not found for ${bimObjectDbId}`);
    } else {
      createCmdProjItm(res, auProp, room.info.id.get(), flagWarining);
    }
  }
  return res;
}

async function getFloorFromRoom(room: SpinalNode, contextGeoId: string) {
  const contextGeo = getRealNode(contextGeoId);
  const floors = await room.getParentsInContext(contextGeo);

  for (const floor of floors) {
    return floor;
  }
}

function createCmdProjItm(
  target: ICmdProjection[],
  auProp: AuProps,
  pNId: string,
  flagWarining: boolean
) {
  const bimFileId = getBimFileIdByModelId(auProp.modelId);
  const itm = target.find(
    (it) => it.bimFileId === bimFileId && pNId === it.pNId
  );
  const revitCat = getCategory(auProp);
  if (itm) {
    const tmp = itm.data.find((it) => it.dbid === auProp.dbId);
    if (!tmp) {
      itm.data.push({
        dbid: auProp.dbId,
        externalId: auProp.externalId,
        name: auProp.name,
        revitCat: revitCat.displayValue,
        flagWarining,
      });
    }
  } else {
    target.push({
      type: 'CmdProjection',
      pNId,
      bimFileId,
      data: [
        {
          dbid: auProp.dbId,
          externalId: auProp.externalId,
          name: auProp.name,
          revitCat: revitCat.displayValue,
          flagWarining,
        },
      ],
    });
  }
}
