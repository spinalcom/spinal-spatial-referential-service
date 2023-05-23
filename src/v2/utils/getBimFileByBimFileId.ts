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

import { SpinalNode, SPINAL_RELATION_PTR_LST_TYPE } from 'spinal-model-graph';
import { getGraph, getRealNode } from './graphservice';

let getBimFileByBimFileIdIt: ReturnType<typeof _getBimFileByBimFileId> = null;

export async function getBimFileByBimFileId(
  bimFileId: string
): Promise<SpinalNode> {
  if (!getBimFileByBimFileIdIt) {
    getBimFileByBimFileIdIt = _getBimFileByBimFileId(bimFileId);
  }
  const data = (await getBimFileByBimFileIdIt.next(bimFileId)).value;
  if (data instanceof Error) throw data;
  return data;
}

async function* _getBimFileByBimFileId(
  bimFileId: string
): AsyncGenerator<SpinalNode | Error, never, string> {
  let nextBimFileId = bimFileId;
  while (true) {
    const bimFile = getRealNode(nextBimFileId);
    if (bimFile) {
      nextBimFileId = yield bimFile;
      continue;
    }
    const graph = getGraph();
    const context = await graph.getContext('BimFileContext');
    if (!context) {
      nextBimFileId = yield new Error('BimFileContext not found in graph');
      continue;
    }
    const child = await context.getChild(
      (node) => node.info.id.get() === nextBimFileId,
      'hasBimFile',
      SPINAL_RELATION_PTR_LST_TYPE
    );
    if (child) {
      nextBimFileId = yield child;
    } else {
      nextBimFileId = yield new Error(`BimFileId [${nextBimFileId}] not found`);
    }
  }
}
