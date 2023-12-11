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
import type { IFloorArchi, TManualAssingment } from '../interfaces/IGetArchi';
import { getNodeInfoArchiAttr } from '../utils/archi/getNodeInfoArchiAttr';
import { getOrLoadModel } from '../utils/getOrLoadModel';
import {
  GEO_BUILDING_RELATION,
  GEO_FLOOR_RELATION,
  GEO_FLOOR_TYPE,
  GEO_SITE_RELATION,
  GEO_ZONE_RELATION,
} from '../../Constant';

export async function getFloorFromContext(
  context: SpinalContext,
  floorArchi: IFloorArchi,
  manualAssingment: TManualAssingment,
  buildingServId: number
): Promise<SpinalNode> {
  // check ManualAssingment retrun it if found;
  const serverId = manualAssingment.get(floorArchi.properties.externalId);
  if (serverId) return getOrLoadModel(serverId);

  // not in manualAssing; get building floors
  const parentNode = buildingServId
    ? await getOrLoadModel<SpinalNode>(buildingServId)
    : context;
  const floorNodes = await parentNode.find(
    [
      GEO_SITE_RELATION,
      GEO_BUILDING_RELATION,
      GEO_FLOOR_RELATION,
      GEO_ZONE_RELATION,
    ],
    (node) => GEO_FLOOR_TYPE === node.info.type.get()
  );

  // search via externalId
  for (const floorNode of floorNodes) {
    if (floorNode.info.externalId?.get() === floorArchi.properties.externalId)
      return floorNode;
  }
  // search via name
  const floorArchiName = <string>(
    getNodeInfoArchiAttr(floorArchi.properties, 'name')
  );

  for (const floorNode of floorNodes) {
    if (floorNode.info.name.get() === floorArchiName) return floorNode;
  }
}
