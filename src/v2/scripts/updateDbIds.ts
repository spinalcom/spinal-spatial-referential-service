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

import { getBimContextByBimFileId } from '../utils/getBimContextByBimFileId';

export async function getExternalIdMapping(
  model: Autodesk.Viewing.Model
): Promise<Record<string, number>> {
  return new Promise((resolve, reject) => {
    model.getExternalIdMapping((mapping: Record<string, number>) => {
      resolve(mapping);
    }, reject);
  });
}

export async function updateDbIds(
  bimFileId: string,
  model: Autodesk.Viewing.Model
): Promise<void> {
  const bimContext = await getBimContextByBimFileId(bimFileId);
  if (typeof bimContext === 'undefined')
    throw new Error('No BimOject found with this bimFileId');
  const map = await getExternalIdMapping(model);
  const bimobjs = await bimContext.getChildren('hasBimObject');
  for (const bimobj of bimobjs) {
    if (bimobj.info.bimFileId.get() === bimFileId) {
      const dbid = map[bimobj.info.externalId.get()];
      if (dbid) bimobj.info.dbid.set(dbid);
      else {
        bimobj.info.dbid.set(-1);
      }
    }
  }
}
