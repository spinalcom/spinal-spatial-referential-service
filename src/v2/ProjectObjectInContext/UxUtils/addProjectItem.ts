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
import type { TProjectionLst } from '../../interfaces/TProjectionLst';
import { ProjectionGroup } from '../ProjectionItem/ProjectionGroup';
import { ProjectionItem } from '../ProjectionItem/ProjectionItem';

export async function addProjectItem(
  list: TProjectionLst,
  prop: AuProps
): Promise<void> {
  let found = false;
  const promRemove: Promise<void>[] = [];
  for (const item of list) {
    if (
      item instanceof ProjectionItem &&
      item.modelId === prop.modelId &&
      item.dbId === prop.dbId
    ) {
      found = true;
      continue;
    } else if (item instanceof ProjectionGroup) {
      promRemove.push(item.deleteItem(prop));
    }
  }
  if (!found) {
    list.push(
      new ProjectionItem(
        prop.name,
        prop.modelId,
        prop.dbId,
        prop.properties,
        prop.externalId
      )
    );
  }
  await Promise.all(promRemove);
}
