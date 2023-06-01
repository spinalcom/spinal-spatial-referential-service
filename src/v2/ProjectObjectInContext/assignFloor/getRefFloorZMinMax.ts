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

import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import type { IFloorZData } from '../../interfaces/IFloorZData';
import { getFragIds } from '../../utils/getFragIds';
import { getWorldBoundingBox } from '../../utils/getWorldBoundingBox';

export async function getRefFloorZMinMax(
  data: Record<string, IAggregateDbidSetByModelItem[]>
): Promise<Record<string, IFloorZData>> {
  const record: Record<string, IFloorZData> = {};
  for (const id in data) {
    const promise: Promise<number>[] = [];
    let min: number = null;
    for (const { dbId: dbids, model } of data[id]) {
      for (const dbid of dbids) {
        promise.push(getMinZ(dbid, model));
      }
    }
    const p = await Promise.all(promise);
    for (const z of p) {
      if (min === null || z < min) min = z;
    }
    const res = { min, max: null, floorId: id, distance: null };
    record[id] = res;
  }
  const tmp: IFloorZData[] = [];
  for (const floorName in record) {
    tmp.push(record[floorName]);
  }
  tmp.sort((a, b) => {
    return a.min - b.min;
  });
  for (let idx = 0; idx < tmp.length; idx++) {
    const itm = tmp[idx];
    itm.max = tmp[idx + 1]?.min || null;
    if (itm.max !== null) {
      tmp[idx].distance = itm.max - itm.min;
    }
  }
  console.log('getRefFloorZMinMax 2 ', tmp);
  const result: Record<string, IFloorZData> = {};
  for (const itm of tmp) {
    result[itm.floorId] = itm;
  }
  console.log('getRefFloorZMinMax 3 ', result);
  return result;
}

async function getMinZ(dbid: number, model: Autodesk.Viewing.Model) {
  const fragIds = await getFragIds(dbid, model);
  const bbox = getWorldBoundingBox(fragIds, model);
  return bbox.min.z;
}
