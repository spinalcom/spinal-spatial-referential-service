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

import { getFragIds } from '../getFragIds';
import { getDbIdChildren } from './getDbIdChildren';

export async function getAll3dbIdsByModel(
  model: Autodesk.Viewing.Model,
  dbIds?: number | number[]
): Promise<number[]> {
  const tree = model.getInstanceTree();
  const resDbid: number[] = [];

  if (typeof dbIds === 'undefined') {
    dbIds = [tree.nodeAccess.rootId];
  } else {
    dbIds = Array.isArray(dbIds) ? dbIds : [dbIds];
  }

  const CHUNK_SIZE = 100;
  for (const el of dbIds) {
    const queue = [el];
    while (queue.length) {
      const chunk = queue.splice(0, CHUNK_SIZE);
      const promises = chunk.map(async (id) => {
        try {
          await getFragIds(id, model);
          resDbid.push(id);
        } catch (err) {
          const children = getDbIdChildren(tree, id);
          if (children.length > 0) {
            queue.push(...children);
          }
        }
      });
      await Promise.all(promises);
    }
  }
  return resDbid;
}
