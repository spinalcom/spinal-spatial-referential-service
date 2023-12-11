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
import type { INodeInfo, TManualAssingment } from '../interfaces/IGetArchi';
import { getNodeInfoArchiAttr } from '../utils/archi/getNodeInfoArchiAttr';
import { getOrLoadModel } from '../utils/getOrLoadModel';

export async function getNodeFromGeo(
  geoNodes: SpinalNode[],
  nodeInfo: INodeInfo,
  manualAssingment: TManualAssingment
): Promise<SpinalNode> {
  // check ManualAssingment retrun it if found;
  const serverId = manualAssingment.get(nodeInfo.externalId);
  if (serverId) return getOrLoadModel(serverId);

  // not in manualAssing
  // search via externalId
  for (const geoRoomNode of geoNodes) {
    if (geoRoomNode.info.externalId?.get() === nodeInfo.externalId)
      return geoRoomNode;
  }
  // search via name
  const roomArchiName = <string>getNodeInfoArchiAttr(nodeInfo, 'name');
  for (const geoRoomNode of geoNodes) {
    if (geoRoomNode.info.externalId?.get() === roomArchiName)
      return geoRoomNode;
  }
}
