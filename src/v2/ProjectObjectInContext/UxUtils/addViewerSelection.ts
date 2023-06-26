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

import type { TProjectionLst } from '../../interfaces/TProjectionLst';
import type { IAuAggregateSelectItem } from '../../interfaces/IAuAggregateSelectItem';
import { getBulkProperties } from '../../utils/projection/getBulkProperties';
import { isProjectionGroup } from '../../utils/projection/isProjectionGroup';
import type { ProjectionItem } from '../ProjectionItem/ProjectionItem';
import { AuProps } from '../../interfaces/AuProps';

export async function addViewerSelection(
  index: number,
  list: TProjectionLst,
  viewer: Autodesk.Viewing.Viewer3D
) {
  const prom: Promise<void>[] = [];
  const toDel: ProjectionItem[] = [];
  const aggregateSelection: IAuAggregateSelectItem[] =
    viewer.getAggregateSelection();
  const aggrProps: AuProps[] = [];
  for (const select of aggregateSelection) {
    const props = await getBulkProperties(select.model, select.selection);
    aggrProps.push(...props);
  }

  for (let idx = 0; idx < list.length; idx++) {
    const item = list[idx];
    if (isProjectionGroup(item)) {
      if (idx === index) {
        prom.push(item.getAndMergeSelection(viewer));
      } else {
        for (const prop of aggrProps) {
          prom.push(item.deleteItem(prop));
        }
      }
    } else {
      for (const select of aggregateSelection) {
        for (const dbId of select.selection) {
          if (select.model.id === item.modelId && dbId === item.dbId) {
            toDel.push(item);
          }
        }
      }
    }
  }
  for (const del of toDel) {
    const idx = list.findIndex((itm) => itm.uid === del.uid);
    if (idx !== -1) {
      list.splice(idx, 1);
    }
  }
  await Promise.all(prom);
}
