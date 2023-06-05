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
import type { SpinalContext } from 'spinal-model-graph';
import {
  GEO_SITE_RELATION,
  GEO_BUILDING_RELATION,
  GEO_FLOOR_RELATION,
  GEO_ROOM_RELATION,
  GEO_ZONE_RELATION,
  GEO_ROOM_TYPE,
  GEO_REFERENCE_ROOM_RELATION,
  GEO_EQUIPMENT_TYPE,
} from '../../../Constant';
import { getModelByBimFileIdLoaded } from '../../utils/projection/getModelByBimFileIdLoaded';

export async function getRoomRef(
  context: SpinalContext
): Promise<IAggregateDbidSetByModelItem[]> {
  const result: IAggregateDbidSetByModelItem[] = [];
  const relNames = [
    GEO_SITE_RELATION,
    GEO_BUILDING_RELATION,
    GEO_FLOOR_RELATION,
    GEO_ROOM_RELATION,
    GEO_ZONE_RELATION,
  ];

  // get rooms nodes
  const rooms = await context.find(relNames, (node) => {
    return node.getType().get() === GEO_ROOM_TYPE;
  });

  // get refObjet from rooms nodes
  const refObjsProm = rooms.map((room) => {
    return room.getChildren([GEO_REFERENCE_ROOM_RELATION]);
  });
  const refObjs = await Promise.all(refObjsProm);

  // merge result by model
  for (const refs of refObjs) {
    for (const ref of refs) {
      if (ref.getType().get() === GEO_EQUIPMENT_TYPE) {
        const bimFileId: string = ref.info.bimFileId.get();
        const model = getModelByBimFileIdLoaded(bimFileId);
        if (model) {
          const dbId: number = ref.info.dbid.get();
          pushToAggregateSetDbidByModel(result, dbId, model);
        }
      }
    }
  }
  return result;
}

export function pushToAggregateSetDbidByModel(
  targetArray: IAggregateDbidSetByModelItem[],
  id: number,
  model: Autodesk.Viewing.Model
): void {
  if (id === -1) return;
  for (const obj of targetArray) {
    if (obj.model === model) {
      obj.dbId.add(id);
      return;
    }
  }

  const idSet = new Set<number>();
  idSet.add(id);
  targetArray.push({
    model,
    dbId: idSet,
  });
}
