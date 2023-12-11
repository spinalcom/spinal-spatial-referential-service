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

import type { SpinalNode } from 'spinal-model-graph';
import { getOrLoadModel } from '../getOrLoadModel';
import {
  GEO_ROOM_RELATION,
  GEO_ROOM_TYPE,
  GEO_ZONE_RELATION,
} from '../../../Constant';

export async function getRoomNodesFromFloor(
  floorServerId: number
): Promise<SpinalNode[]> {
  const floorNode = await getOrLoadModel<SpinalNode>(floorServerId);
  return floorNode.find(
    [GEO_ROOM_RELATION, GEO_ZONE_RELATION],
    (node) => GEO_ROOM_TYPE === node.info.type.get()
  );
}
