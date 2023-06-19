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

import type { Model, Val } from 'spinal-core-connectorjs_type';
import type { IAuAggregateSelectItem } from '../../interfaces/IAuAggregateSelectItem';
import { getBimContextByBimFileId, getViewer } from '../../utils';
import {
  GEO_EQUIPMENT_RELATION,
  GEO_REFERENCE_ROOM_RELATION,
} from '../../../Constant';

export async function getRoomNodeFromSelectFloor() {
  const bimObj = await getFloorSelectedBimObj();
  if (bimObj) {
    const parents = await bimObj.getParents(GEO_REFERENCE_ROOM_RELATION);
    return parents[0];
  }
}
async function getFloorSelectedBimObj() {
  const aggregateSelection: IAuAggregateSelectItem[] =
    getViewer().getAggregateSelection();
  const { model, dbid } = get1stDbidFromAggre(aggregateSelection);
  if (!model && !dbid) return;
  const bimFileId = getBimFileIdByModelId(model.id);
  const bimContext = await getBimContextByBimFileId(bimFileId);
  const bimobjs = await bimContext.getChildren(GEO_EQUIPMENT_RELATION);
  for (const bimObj of bimobjs) {
    if (bimObj.info.dbid.get() === dbid) return bimObj;
  }
}

function get1stDbidFromAggre(aggregateSelection: IAuAggregateSelectItem[]) {
  for (const { model, selection } of aggregateSelection) {
    return { model, dbid: selection[0] };
  }
}

function getBimFileIdByModelId(modelId: number): string {
  const mappingBimFileIdModelId: Record<
    string,
    {
      modelId: number;
      modelScene: { model: Autodesk.Viewing.Model; scene: Model }[];
      version: Val;
    }
  > = window.spinal.BimObjectService.mappingBimFileIdModelId;
  for (const bimFileId in mappingBimFileIdModelId) {
    if (
      Object.prototype.hasOwnProperty.call(mappingBimFileIdModelId, bimFileId)
    ) {
      const obj = mappingBimFileIdModelId[bimFileId];
      if (obj.modelId === modelId) {
        for (const { model } of obj.modelScene) {
          if (model.id === modelId) return bimFileId;
        }
      }
    }
  }
}
