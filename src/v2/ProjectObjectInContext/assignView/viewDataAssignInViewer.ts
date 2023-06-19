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

import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import type { SpinalNode } from 'spinal-model-graph';
import { GEO_REFERENCE_ROOM_RELATION } from '../../../Constant';
import { getModelByBimFileIdLoaded, getRealNode, getViewer } from '../../utils';
import { getAllModelLoaded } from '../../utils/projection/getAllModelLoaded';
import { pushToAggregateSetDbidByModel } from '../projection/getRoomRef';

/**
 * obj = blue
 * roomSelect = yellow
 * if validId; valid = green & parent = red
 * else parent = green
 * @export
 * @param {number} dbid
 * @param {string} bimFileId
 * @param {string} [roomId]
 * @param {string} [parentValidId]
 * @param {string} [parentNodeId]
 */
export async function viewDataAssignInViewer(
  dbid: number,
  bimFileId: string,
  roomId?: string,
  parentValidId?: string,
  parentNodeId?: string
) {
  const models = getAllModelLoaded();
  const viewer = getViewer();
  // clean model selection / isolation
  for (const model of models) {
    viewer.clearThemingColors(model);
  }
  const green = new THREE.Vector4(0, 227, 0);
  const red = new THREE.Vector4(255, 0, 0);
  const roomIdColor = new THREE.Vector4(227, 219, 0);
  const modelDbid = getModelByBimFileIdLoaded(bimFileId);
  if (modelDbid) {
    viewer.clearSelection();
    viewer.select(dbid, modelDbid);
  }
  const aggrData: IAggregateDbidSetByModelItem[] = [
    {
      dbId: new Set([dbid]),
      model: modelDbid,
    },
  ];
  let colorValid: THREE.Vector4, colorParent: THREE.Vector4;
  if (parentValidId) {
    colorValid = green;
    colorParent = red;
  } else {
    colorValid = red;
    colorParent = green;
  }
  if (roomId) await getRoomRefsInfo(getRealNode(roomId), aggrData, roomIdColor);
  if (parentNodeId)
    await getRoomRefsInfo(getRealNode(parentNodeId), aggrData, colorParent);
  if (parentValidId)
    await getRoomRefsInfo(getRealNode(parentValidId), aggrData, colorValid);

  viewer.fitToView(Array.from(aggrData[0].dbId), aggrData[0].model);
  const data = aggrData.map((itm) => {
    return {
      model: itm.model,
      selection: Array.from(itm.dbId),
    };
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  viewer.impl.visibilityManager.aggregateIsolate(data);
}

async function getRoomRefsInfo(
  roomNode: SpinalNode,
  aggrData: IAggregateDbidSetByModelItem[],
  color: THREE.Vector4
) {
  const viewer = getViewer();
  if (roomNode) {
    const roomRefs = await roomNode.getChildren(GEO_REFERENCE_ROOM_RELATION);
    for (const roomRef of roomRefs) {
      const model = getModelByBimFileIdLoaded(roomRef.info.bimFileId.get());
      if (model) {
        const dbid = roomRef.info.dbid.get();
        viewer.setThemingColor(dbid, color, model);
        pushToAggregateSetDbidByModel(aggrData, dbid, model);
      }
    }
  }
}
export function clearThemingColors() {
  const models = getAllModelLoaded();
  const viewer = getViewer();
  for (const model of models) {
    viewer.clearThemingColors(model);
  }
}
