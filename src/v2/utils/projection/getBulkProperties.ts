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

import type { AuProps } from '../../interfaces/AuProps';
import { getModelByModelId } from './getModelByModelId';

export function getBulkProperties(
  model: number | Autodesk.Viewing.Model,
  dbIds: number[] | Set<number>,
  props = { propFilter: ['name', 'externalId'] }
): Promise<AuProps[]> {
  let m: Autodesk.Viewing.Model;
  if (typeof model === 'number') {
    m = getModelByModelId(model);
  } else {
    m = model;
  }
  return new Promise((resolve, reject) => {
    m.getBulkProperties(
      Array.from(dbIds),
      props,
      (result) => {
        const map = result.map((e): AuProps => {
          return Object.assign(e, {
            id: `${m.id}-${e.dbId}`,
            modelId: m.id,
          });
        });
        resolve(map);
      },
      (err) => reject(err)
    );
  });
}
