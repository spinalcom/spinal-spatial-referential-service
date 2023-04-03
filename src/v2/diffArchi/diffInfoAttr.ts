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
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import {
  EModificationType,
  IDiffNodeInfoAttr,
  IDiffObj,
  INodeInfo,
} from '../interfaces/IGetArchi';
import { checkDiffObj } from './checkDiffObj';
import { getNodeInfoArchiAttr } from '../utils/getNodeInfoArchiAttr';

export async function diffInfoAttr(
  nodeInfo: INodeInfo,
  spinalNode: SpinalNode
): Promise<IDiffNodeInfoAttr> {
  nodeInfo.spinalnodeServerId = spinalNode._server_id;
  nodeInfo.modificationType = 0;
  const diffInfo: IDiffObj[] = [];
  // check dbId
  checkDiffObj(diffInfo, 'dbid', spinalNode.info.dbid?.get(), nodeInfo.dbId);
  // check externalId
  checkDiffObj(
    diffInfo,
    'externalId',
    spinalNode.info.externalId?.get(),
    nodeInfo.externalId
  );
  // check name node
  const name = <string>getNodeInfoArchiAttr(nodeInfo, 'name');
  const number = <string>getNodeInfoArchiAttr(nodeInfo, 'number');
  checkDiffObj(
    diffInfo,
    'name',
    spinalNode.info.name.get(),
    number ? `${number}-${name}` : name
  );

  // -> diff archi attr
  const categoryNodeSpatial = await attributeService.getCategoryByName(
    spinalNode,
    'Spatial'
  );
  const attrs = await attributeService.getAttributesByCategory(
    spinalNode,
    categoryNodeSpatial
  );
  const diffAttr: IDiffObj[] = [];
  for (const archiProps of nodeInfo.properties) {
    if (archiProps.category === '__internalref__') continue; // if level skip (will be set later)
    let find = false;
    for (const attr of attrs) {
      if (archiProps.name === attr.label.get()) {
        checkDiffObj(
          diffAttr,
          archiProps.name,
          attr.value.get(),
          archiProps.value,
          archiProps.dataTypeContext
        );
        find = true;
        break;
      }
    }
    if (find === false) {
      checkDiffObj(
        diffAttr,
        archiProps.name,
        undefined,
        archiProps.value,
        archiProps.dataTypeContext
      );
    }
  }

  if (diffInfo.length > 0) {
    nodeInfo.modificationType =
      nodeInfo.modificationType | EModificationType.update;
    nodeInfo.modificationType =
      nodeInfo.modificationType | EModificationType.updateNode;
  }
  if (diffAttr.length > 0) {
    nodeInfo.modificationType =
      nodeInfo.modificationType | EModificationType.update;
    nodeInfo.modificationType =
      nodeInfo.modificationType | EModificationType.updateAttr;
  }
  return {
    diffInfo,
    diffAttr,
  };
}
