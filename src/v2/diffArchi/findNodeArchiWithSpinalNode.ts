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
import { FileSystem } from 'spinal-core-connectorjs';

export function findNodeArchiWithSpinalNode(
  node: SpinalNode,
  nodeInfosArchi: INodeInfo[],
  manualAssingment: TManualAssingment
): INodeInfo {
  // check ManualAssingment retrun it if found;
  for (const [extId, serverId] of manualAssingment) {
    if (FileSystem._objects[serverId] === node) {
      for (const nodeArchi of nodeInfosArchi) {
        if (nodeArchi.externalId === extId) {
          return nodeArchi;
        }
      }
    }
  }
  // search via externalId
  for (const nodeArchi1 of nodeInfosArchi) {
    if (nodeArchi1.externalId === node.info.externalId?.get()) {
      return nodeArchi1;
    }
  }

  // search via name
  for (const nodeArchi2 of nodeInfosArchi) {
    const nodeArchiName = <string>getNodeInfoArchiAttr(nodeArchi2, 'name');
    if (nodeArchiName === node.info.name?.get()) {
      return nodeArchi2;
    }
  }
}
