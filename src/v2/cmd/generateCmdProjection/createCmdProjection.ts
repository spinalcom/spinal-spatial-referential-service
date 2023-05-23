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
import { getBimContextByBimFileId, getBimFileIdByModelId } from '../../utils';
import { getModelByModelId } from '../../utils/projection/getModelByModelId';
import {
  GEO_EQUIPMENT_RELATION,
  GEO_REFERENCE_ROOM_RELATION,
  GEO_ROOM_TYPE,
} from '../../../Constant';
import { getProperties } from '../../utils/projection/getProperties';

export async function createCmdProjection(
  intersects: IRaycastIntersectRes[],
  contextGeoId: string
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
    if (!room) {
      console.error(`createCmdProjection: room not found for ${bimObjectDbId}`);
    } else {
      createCmdProjItm(res, auProp, room.info.id.get());
    }
  }
  return res;
}
async function getIntersectionRoom(
  dbId: number,
  modelId: number,
  dicoBimObjs: Record<string, SpinalNode[]>,
  contextGeoId: string
): Promise<SpinalNode> {
  const roomRefObjModel = getModelByModelId(modelId);
  const bimFileId = getBimFileIdByModelId(roomRefObjModel.id);
  const refObj = await getBimObjFromBimFileId(dicoBimObjs, bimFileId, dbId);
  const rooms = await refObj.getParents(GEO_REFERENCE_ROOM_RELATION);
  const filteredRooms = rooms.filter((room) => {
    return (
      room.info.type.get() === GEO_ROOM_TYPE &&
      room.contextIds.has(contextGeoId)
    );
  });
  const room = filteredRooms[0];
  return room;
}

async function getBimObjFromBimFileId(
  dico: Record<string, SpinalNode[]>,
  bimFileId: string,
  bimObjectDbId: number
): Promise<SpinalNode> {
  const bimObjs = await getBimObjsOfBimFileId(dico, bimFileId);
  for (const bimObj of bimObjs) {
    if (bimObj.info.dbid.get() === bimObjectDbId) {
      return bimObj;
    }
  }
}

async function getBimObjsOfBimFileId(
  dico: Record<string, SpinalNode[]>,
  bimFileId: string
): Promise<SpinalNode[]> {
  const _bimObjs = dico[bimFileId];
  if (_bimObjs) return _bimObjs;
  const bimContext = await getBimContextByBimFileId(bimFileId);
  const bimObjs = await bimContext.getChildren(GEO_EQUIPMENT_RELATION);
  dico[bimFileId] = bimObjs;
  return bimObjs;
}

function getCategory(props: AuProps) {
  for (const prop of props.properties) {
    // {displayName: "Category", displayValue: "Revit ", displayCategory: "__category__", attributeName: "Category", type: 20}
    if (
      prop.attributeName === 'Category' &&
      prop.displayCategory === '__category__'
    ) {
      return prop;
    }
  }
}
function createCmdProjItm(
  target: ICmdProjection[],
  auProp: AuProps,
  pNId: string
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
        },
      ],
    });
  }
}
