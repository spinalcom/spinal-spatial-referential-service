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
  IFloorArchi,
  IGetArchi,
  INodeInfo,
  IRoomArchi,
  IStructures,
  TManualAssingment,
} from '../interfaces';
import { floorArchiHasChildren } from './floorArchiHasChildren';
import { getFloorFromContext } from './getFloorFromContext';
import { SpinalContext, SpinalNode } from 'spinal-model-graph';

export async function mergeManualAssignArchiFloor(
  archiData: IGetArchi,
  manualAssingment: TManualAssingment,
  context: SpinalContext,
  buildingServerId?: number
) {
  const mapFloor = new Map<SpinalNode, IFloorArchi[]>();
  const toCreate: IFloorArchi[] = [];
  for (const extId in archiData) {
    if (Object.prototype.hasOwnProperty.call(archiData, extId)) {
      const floorArchi = archiData[extId];
      if (floorArchiHasChildren(floorArchi)) {
        const floorNode = await getFloorFromContext(
          context,
          floorArchi,
          manualAssingment,
          buildingServerId
        );
        if (floorNode) pushToMapArray(mapFloor, floorNode, floorArchi);
        else {
          toCreate.push(floorArchi);
        }
      }
    }
  }
  const toCreateFromMap: IFloorArchi[] = [];
  for (const [, floorArchiArr] of mapFloor) {
    if (floorArchiArr.length <= 1) {
      toCreateFromMap.push(...floorArchiArr);
      continue;
    }
    let mergedFloor: IFloorArchi = undefined;
    for (let idx = 0; idx < floorArchiArr.length; idx++) {
      const floorArchi = floorArchiArr[idx];
      mergedFloor = mergeFloorArchi(floorArchi, mergedFloor);
    }
  }

  return toCreateFromMap.concat(...toCreate);
}
function pushToMapArray<K, A>(map: Map<K, A[]>, node: K, floorArchi: A) {
  let arr = map.get(node);
  if (!arr) {
    arr = [];
    map.set(node, arr);
  }
  arr.push(floorArchi);
}
function mergeFloorArchi(
  from: IFloorArchi,
  to: IFloorArchi | undefined
): IFloorArchi {
  const properties: INodeInfo = {
    dbId: from.properties.dbId,
    externalId: from.properties.externalId,
    spinalnodeServerId: from.properties.spinalnodeServerId,
    properties: from.properties.properties,
  };
  if (!to) {
    const children: Record<string, IRoomArchi> = {};
    const structures: IStructures = {};
    to = {
      properties,
      children,
      structures,
      propertiesArr: [],
    };
  } else {
    to.merged = (to.merged || 0) + 1;
    to.propertiesArr.push(properties);
  }
  for (const ext in from.children) {
    if (Object.prototype.hasOwnProperty.call(from.children, ext)) {
      to.children[ext] = from.children[ext];
    }
  }
  for (const ext in from.structures) {
    if (Object.prototype.hasOwnProperty.call(from.structures, ext)) {
      to.structures[ext] = from.structures[ext];
    }
  }
  return to;
}
