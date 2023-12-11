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
import { GEO_EQUIPMENT_RELATION } from '../../Constant';
import { getBimContextByBimFileId } from '../utils/getBimContextByBimFileId';
import { getExternalIdMapping } from '../utils/getExternalIdMapping';

export async function updateBimObjectFromBimFileId(
  bimFileId: string,
  model: Autodesk.Viewing.Model,
  updateBimobjectsName: boolean,
  updateBimobjectsDbid: boolean
): Promise<void> {
  if (!updateBimobjectsName && !updateBimobjectsDbid) return;
  const bimContext = await getBimContextByBimFileId(bimFileId);
  if (typeof bimContext === 'undefined')
    throw new Error('No BimOject found with this bimFileId');
  const map = await getExternalIdMapping(model);
  const bimobjs = await bimContext.getChildren(GEO_EQUIPMENT_RELATION);
  const promises: Promise<void>[] = [];
  for (const bimobj of bimobjs) {
    if (bimobj.info.bimFileId.get() === bimFileId) {
      const dbid = map[bimobj.info.externalId.get()];
      if (updateBimobjectsDbid) {
        if (dbid) bimobj.info.dbid.set(dbid);
        else {
          bimobj.info.dbid.set(-1);
        }
      } else if (updateBimobjectsName && dbid) {
        promises.push(updateName(model, dbid, bimobj));
      }
    }
  }
  // 20s timeout
  await Promise.race([Promise.all(promises), timeout(20000)])
}

function timeout(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject();
    }, ms)
  })
}

function updateName(model: Autodesk.Viewing.Model, dbid: number, bimobj: SpinalNode) {
  return new Promise<void>(resolve => {
    model.getProperties(dbid, (prop) => {
      if (prop?.name) {
        bimobj.info.name.set(prop.name);
      }
      resolve();
    });
  })
}
