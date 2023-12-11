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

import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import {
  EModificationType,
  type IDiffRoomChildren,
  type IFloorArchi,
  type IRoomArchi,
  type IUpdateRoomDiff,
  type TManualAssingment,
} from '../interfaces/IGetArchi';
import { getNodeFromGeo } from './getNodeFromGeo';
import { findNodeArchiWithSpinalNode } from './findNodeArchiWithSpinalNode';
import { diffInfoAttr } from './diffInfoAttr';

export async function diffRoomChildren(
  floorNode: SpinalNode,
  contextGeo: SpinalContext,
  floorArchi: IFloorArchi,
  manualAssingment: TManualAssingment
): Promise<IDiffRoomChildren> {
  const updateRooms: IUpdateRoomDiff[] = [];
  const newRooms: IRoomArchi[] = [];
  const delRooms: number[] = [];
  const proms: Promise<void>[] = [];

  const roomNodes = await floorNode.getChildrenInContext(contextGeo);
  for (const [, roomAchi] of Object.entries(floorArchi.children)) {
    const roomNode = await getNodeFromGeo(
      roomNodes,
      roomAchi.properties,
      manualAssingment
    );
    if (!roomNode) {
      // not found
      newRooms.push(roomAchi);
      roomAchi.properties.modificationType = EModificationType.create;
      roomAchi.properties.spinalnodeServerId = floorNode._server_id;
      continue;
    }
    proms.push(
      diffInfoAttr(roomAchi.properties, roomNode).then((diff) => {
        if (diff.diffAttr.length === 0 && diff.diffInfo.length === 0) {
          return;
        }
        updateRooms.push({
          roomArchi: roomAchi,
          diff,
        });
      })
    );
  }

  await Promise.all(proms);
  const nodeInfosArchi = Object.values(floorArchi.children).map(
    (it) => it.properties
  );

  for (const roomNode of roomNodes) {
    const roomArchi = await findNodeArchiWithSpinalNode(
      roomNode,
      nodeInfosArchi,
      manualAssingment
    );
    if (roomArchi === undefined) {
      delRooms.push(roomNode._server_id);
    }
  }

  return { newRooms, updateRooms, delRooms };
}
