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

import type { IIntersectRes } from '../../interfaces/IIntersectRes';
import type { IIntersectNotFound } from '../../interfaces/IIntersectNotFound';

export function getDiffSelection(
  intersectRes: IIntersectRes
): IIntersectNotFound[] {
  const data: IIntersectNotFound[] = [];
  for (const { model, dbId } of intersectRes.selection) {
    for (const id of dbId) {
      let found = false;
      for (const { origin } of intersectRes.intersects) {
        if (origin.modelId === model.id && origin.dbId === id.dbId) {
          found = true;
          break;
        }
      }
      if (!found) {
        pushToData(data, id.dbId, model);
      }
    }
  }
  return data;
}

function pushToData(
  data: IIntersectNotFound[],
  dbId: number,
  model: Autodesk.Viewing.Model
) {
  for (const item of data) {
    if (item.model.id === model.id) {
      item.dbIds.add(dbId);
      return;
    }
  }
  data.push({
    model,
    dbIds: new Set([dbId]),
  });
}
