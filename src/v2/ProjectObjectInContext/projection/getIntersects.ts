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

import type { SpinalVec3 } from '../../interfaces';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { ProjectionGroupConfig } from '../ProjectionItem/ProjectionGroupConfig';
import type { IIntersectRes } from '../../interfaces/IIntersectRes';
import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import { raycastItemToMesh } from './raycastItemToMesh';
import { getLeafDbIdsByModel } from '../../utils/projection/getLeafDbIdsByModel';
import { transformRtzToXyz } from '../../utils/projection/transformRtzToXyz';
import { isProjectionGroup } from '../../utils/projection/isProjectionGroup';
import { getModelByModelId } from '../../utils/projection/getModelByModelId';
import { getViewer } from '../../utils/getViewer';
import { getAll3dbIdsByModel } from '../../utils/projection/getAll3dbIdsByModel';

export async function getIntersects(
  projectionGroupConfig: ProjectionGroupConfig,
  mergedRoomRef: IAggregateDbidSetByModelItem[]
): Promise<IIntersectRes> {
  const selection: IAggregateDbidByModelItem[] = [];
  projectionGroupConfig.progress = 0;
  try {
    const chunkSize = 50;
    const total = projectionGroupConfig.data.length;
    for (let start = 0; start < total; start += chunkSize) {
      const end = Math.min(start + chunkSize, total);
      const chunk = projectionGroupConfig.data.slice(start, end);

      for (let idx = 0; idx < chunk.length; idx++) {
        const itemToProj = chunk[idx];
        const _offset = transformRtzToXyz(itemToProj.offset);
        if (isProjectionGroup(itemToProj)) {
          for (const itm of itemToProj.computedData) {
            const model = getModelByModelId(itm.modelId);
            let ids: number[] = [];
            if (itemToProj.stopAtLeaf === true) {
              ids = getLeafDbIdsByModel(model, itm.dbId);
            } else {
              ids = await getAll3dbIdsByModel(model, itm.dbId);
            }
            if (ids.length === 0) continue;
            pushToAggregateDbidByModel(
              selection,
              ids,
              model,
              _offset,
              itm.dbId
            );
          }
        } else {
          const model = getModelByModelId(itemToProj.modelId);
          const ids = getLeafDbIdsByModel(model, itemToProj.dbId);
          pushToAggregateDbidByModel(
            selection,
            ids,
            model,
            _offset,
            itemToProj.dbId
          );
        }
        projectionGroupConfig.progress = ((start + idx + 1) / total) * 66;
      }
    }
    console.log('selection', selection);
    debugger;
    const intersects = await raycastItemToMesh(
      selection,
      mergedRoomRef,
      getViewer()
    );
    projectionGroupConfig.progress = 100;
    return { selection, intersects };
  } catch (error) {
    projectionGroupConfig.progress = 100;
    console.error(error);
  }
}

export function pushToAggregateDbidByModel(
  targetArray: IAggregateDbidByModelItem[],
  ids: number[],
  model: Autodesk.Viewing.Model,
  offset: SpinalVec3,
  rootDbId: number
): void {
  for (const obj of targetArray) {
    if (obj.model === model) {
      for (const id of ids) {
        const findItem = obj.dbId.find((a) => a.dbId === id);
        const isFocus = rootDbId === id;
        if (findItem === undefined) {
          obj.dbId.push({ dbId: id, offset, isFocus });
        } else if (isFocus === true && findItem.isFocus === false) {
          findItem.isFocus = true;
          findItem.offset = offset;
        }
      }
      return;
    }
  }

  const dbId = [];
  for (const id of ids) {
    const isFocus = rootDbId === id;
    dbId.push({ dbId: id, offset, isFocus });
  }
  targetArray.push({
    model,
    dbId,
  });
}
