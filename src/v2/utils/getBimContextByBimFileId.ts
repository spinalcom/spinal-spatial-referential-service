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

import { SpinalNode } from 'spinal-model-graph';
import { SPINAL_RELATION_PTR_LST_TYPE } from 'spinal-model-graph';
import { getBimFileByBimFileId } from './getBimFileByBimFileId';
import { BIMCONTEXT_RELATION_NAME } from '../constant';

const createBimContextIt = new Map<
  string,
  ReturnType<typeof _createBimContext>
>();
export async function getBimContextByBimFileId(
  bimFileId: string,
  doCreate = false
): Promise<SpinalNode> {
  const bimFile = await getBimFileByBimFileId(bimFileId);
  const bimContexts = await bimFile.getChildren(BIMCONTEXT_RELATION_NAME);
  if (bimContexts.length > 0) {
    return bimContexts[0];
  }
  if (doCreate === true) {
    let it = createBimContextIt.get(bimFileId);
    if (!it) {
      it = _createBimContext(bimFile);
      createBimContextIt.set(bimFileId, it);
    }
    return (await it.next()).value;
  }
}

async function* _createBimContext(
  bimFile: SpinalNode
): AsyncGenerator<SpinalNode, never, void> {
  const bimContext = new SpinalNode('BIMContext', 'SpinalNode');
  await bimFile.addChild(
    bimContext,
    BIMCONTEXT_RELATION_NAME,
    SPINAL_RELATION_PTR_LST_TYPE
  );
  while (true) {
    yield bimContext;
  }
}
