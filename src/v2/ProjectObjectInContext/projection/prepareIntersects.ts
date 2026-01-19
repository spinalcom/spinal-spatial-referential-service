/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { ProjectionGroupConfig } from '../ProjectionItem/ProjectionGroupConfig';
import { getLeafDbIdsByModel } from '../../utils/projection/getLeafDbIdsByModel';
import { transformRtzToXyz } from '../../utils/projection/transformRtzToXyz';
import { isProjectionGroup } from '../../utils/projection/isProjectionGroup';
import { getModelByModelId } from '../../utils/projection/getModelByModelId';
import { getAll3dbIdsByModel } from '../../utils/projection/getAll3dbIdsByModel';
import { pushToAggregateDbidByModel } from './pushToAggregateDbidByModel';
import type { SpinalVec3 } from '../../interfaces';

export async function prepareIntersects(
  projectionGroupConfig: ProjectionGroupConfig
) {
  const itemsToIntersect: IAggregateDbidByModelItem[] = [];
  const itemsToAproximate: IAggregateDbidByModelItem[] = [];
  projectionGroupConfig.progress = 0;
  try {
    let proms = [];
    for (let idx = 0; idx < projectionGroupConfig.data.length; idx++) {
      const itemToProj = projectionGroupConfig.data[idx];
      const _offset = transformRtzToXyz(itemToProj.offset);
      if (isProjectionGroup(itemToProj)) {
        for (const itm of itemToProj.computedData) {
          proms.push(
            processProjectionData(
              itm.modelId,
              itm.dbId,
              itemsToAproximate,
              _offset,
              itemsToIntersect,
              itemToProj.stopAtLeaf,
              itemToProj.aproximateByLevel
            )
          );
        }
      } else {
        proms.push(
          processProjectionData(
            itemToProj.modelId,
            itemToProj.dbId,
            itemsToAproximate,
            _offset,
            itemsToIntersect,
            itemToProj.stopAtLeaf,
            itemToProj.aproximateByLevel
          )
        );
      }
      if (proms.length >= 200) {
        projectionGroupConfig.progress =
          ((idx + 1) / projectionGroupConfig.data.length) * 100;
        await Promise.all(proms);
        proms = [];
      }
    }
    await Promise.all(proms);
    projectionGroupConfig.progress = 100;
    return { itemsToAproximate, itemsToIntersect };
  } catch (error) {
    projectionGroupConfig.progress = 100;
    console.error(error);
  }
}

async function processProjectionData(
  modelId: number,
  dbId: number,
  itemsToAproximate: IAggregateDbidByModelItem[],
  _offset: SpinalVec3,
  itemsToIntersect: IAggregateDbidByModelItem[],
  stopAtLeaf: boolean,
  aproximateByLevel: boolean
) {
  const model = getModelByModelId(modelId);
  let ids: number[] = [];
  if (stopAtLeaf === true) {
    ids = getLeafDbIdsByModel(model, dbId);
  } else {
    ids = await getAll3dbIdsByModel(model, dbId);
  }
  if (ids.length === 0) return;
  if (aproximateByLevel === true) {
    pushToAggregateDbidByModel(itemsToAproximate, ids, model, _offset, dbId);
  } else {
    pushToAggregateDbidByModel(itemsToIntersect, ids, model, _offset, dbId);
  }
}
