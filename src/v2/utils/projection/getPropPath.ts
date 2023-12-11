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

import { getBulkProperties } from './getBulkProperties';

export async function getPropPath(
  dbId: number,
  model: Autodesk.Viewing.Model
): Promise<string[]> {
  const res: string[] = [];
  const tree = model.getInstanceTree();
  const rootId = tree.nodeAccess.rootId;
  let currentDbId = dbId;
  while (currentDbId != rootId) {
    const props = await getBulkProperties(model, [currentDbId], {
      propFilter: ['name', 'externalId', 'parent'],
    });
    const prop = props[0];
    res.push(prop.name);
    const p = prop.properties.find((p) => p.attributeName === 'parent');
    if (!p) return undefined;
    currentDbId = parseInt(p.displayValue?.toString());
  }
  return res.reverse();
}
