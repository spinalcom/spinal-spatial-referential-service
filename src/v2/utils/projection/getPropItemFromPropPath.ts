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

import type { AuProps } from '../../interfaces';
import { getBulkProperties } from './getBulkProperties';
import { getDbIdChildren } from './getDbIdChildren';

export async function getPropItemFromPropPath(
  propPath: string[],
  model: Autodesk.Viewing.Model
): Promise<AuProps> {
  const tree = model.getInstanceTree();
  let currDbId = tree.nodeAccess.rootId;
  let lastFound: AuProps;
  for (const nameProp of propPath) {
    const childrenDbId = getDbIdChildren(tree, currDbId);
    const childrenProps = await getBulkProperties(model, childrenDbId);
    lastFound = childrenProps.find((itm) => itm.name === nameProp);
    if (!lastFound) return undefined;
    currDbId = lastFound.dbId;
  }
  return lastFound ? lastFound : undefined;
}
