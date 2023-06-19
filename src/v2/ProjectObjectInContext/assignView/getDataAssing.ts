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

import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { getContextSpatial, getGraph, getRealNode } from '../../utils';
import type { IManualAssingData } from '../../interfaces/IManualAssingData';

async function getParentRoom(
  node: SpinalNode,
  contextGeo: SpinalContext
): Promise<SpinalNode> {
  const res = await node.getParentsInContext(contextGeo);
  return res[0];
}
export async function getDataAssing({
  contextId,
  selectedNodeId,
}: {
  contextId: string;
  selectedNodeId: string;
}): Promise<{ warn: IManualAssingData[]; error: IManualAssingData[] }> {
  const graph = getGraph();
  const contextGeo = await getContextSpatial(graph);
  const context = getRealNode(contextId);
  const selectedNode = getRealNode(selectedNodeId);
  const warn: IManualAssingData[] = [];
  const error: IManualAssingData[] = [];

  const children = await selectedNode.getChildrenInContext(context);
  for (const child of children) {
    const arr = child.info.name.get() === 'error' ? error : warn;
    const items = await child.getChildrenInContext(context);
    for (const item of items) {
      let PNId = '';
      let PName = '';
      if (child.info.name.get() === 'warn') {
        // get parent ID
        const parent = await getParentRoom(item, contextGeo);
        PNId = parent?.info.id.get() || '';
        PName = parent?.info.name.get() || '';
      }
      arr.push({
        name: item.info.name.get(),
        PNId,
        PName,
        bimFileId: item.info.bimFileId.get(),
        dbid: item.info.dbid.get(),
        externalId: item.info.externalId.get(),
        validId: '',
      });
    }
  }
  return {
    warn,
    error,
  };
}
