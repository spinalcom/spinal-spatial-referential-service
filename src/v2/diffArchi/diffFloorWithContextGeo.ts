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

import type { SpinalContext } from 'spinal-model-graph';
import {
  EModificationType,
  type IDiffFloor,
  type IFloorArchi,
  type TManualAssingment,
} from '../interfaces/IGetArchi';
import { getFloorFromContext } from './getFloorFromContext';
import { getDiffRefFloor } from './getDiffRefFloor';
import { diffRoomChildren } from './diffRoomChildren';
import { diffInfoAttr } from './diffInfoAttr';

export async function diffFloorWithContextGeo(
  floorArchi: IFloorArchi,
  contextGeo: SpinalContext,
  buildingServerId: number,
  manualAssingment: TManualAssingment
): Promise<IDiffFloor> {
  const floorNode = await getFloorFromContext(
    contextGeo,
    buildingServerId,
    floorArchi,
    manualAssingment
  );
  if (!floorNode) {
    // floor not found
    floorArchi.properties.modificationType = EModificationType.create;
    return undefined;
  }
  // archi exist in context

  const [diffInfo, diffRoom, diffRef] = await Promise.all([
    // -> diff archi info
    diffInfoAttr(floorArchi.properties, floorNode),
    // -> diff archi children
    diffRoomChildren(floorNode, contextGeo, floorArchi, manualAssingment),
    // diff structures
    getDiffRefFloor(floorNode, floorArchi, manualAssingment),
  ]);
  return {
    diffInfo,
    diffRoom,
    diffRef,
  };
}
