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
import {
  EModificationType,
  type IDiffBimObj,
  type INodeInfo,
  type TManualAssingment,
} from '../interfaces/IGetArchi';
import { getNodeFromGeo } from './getNodeFromGeo';
import { findNodeArchiWithSpinalNode } from './findNodeArchiWithSpinalNode';

export async function diffBimObjs(
  bimObjInfos: INodeInfo[],
  bimObjNodes: SpinalNode[],
  manualAssingment: TManualAssingment
): Promise<IDiffBimObj> {
  const newBimObj: INodeInfo[] = [];
  const delBimObj: number[] = [];

  for (const bimObjInfo of bimObjInfos) {
    const node = await getNodeFromGeo(
      bimObjNodes,
      bimObjInfo,
      manualAssingment
    );
    if (!node) {
      // not found
      newBimObj.push(bimObjInfo);
      bimObjInfo.modificationType = EModificationType.create;
      continue;
    }
  }
  for (const bimObjNode of bimObjNodes) {
    const nodeArchi = await findNodeArchiWithSpinalNode(
      bimObjNode,
      bimObjInfos,
      manualAssingment
    );
    if (nodeArchi === undefined) delBimObj.push(bimObjNode._server_id);
  }
  return { newBimObj, delBimObj };
}
