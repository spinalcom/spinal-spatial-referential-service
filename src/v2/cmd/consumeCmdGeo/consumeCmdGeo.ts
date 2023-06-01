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

import type { ICmdNew } from '../../interfaces/ICmdNew';
import {
  SpinalNode,
  SpinalContext,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-model-graph';
import { getContextSpatial } from '../../utils/getContextSpatial';
import {
  EQUIPMENT_TYPE,
  REFERENCE_RELATION,
  REFERENCE_ROOM_RELATION,
  ROOM_RELATION,
  addFloor,
  addRoom,
} from 'spinal-env-viewer-context-geographic-service';
import { consumeBatch } from '../../../utils/consumeBatch';
import { updateAttr } from '../../utils/archi/updateAttr';
import { updateInfo } from '../../utils/archi/updateInfo';
import { updateInfoByKey } from '../../utils/archi/updateInfoByKey';
import { getGraph, getRealNode } from '../../utils/graphservice';
import { waitGetServerId } from '../../utils/waitGetServerId';
import { getBimContextByBimFileId } from '../../utils/getBimContextByBimFileId';
import { ARCHIVE_RELATION_NAME } from '../../constant';
import { GEO_EQUIPMENT_RELATION } from '../../../Constant';

export async function consumeCmdGeo(
  cmds: ICmdNew[][],
  nodeGenerationId: string,
  contextGenerationId: string,
  callbackProg?: (indexCmd: number, idxInCmd: number) => void
) {
  const graph = getGraph();
  const contextGeo = await getContextSpatial(graph);
  const dico: Record<string, SpinalNode> = {};
  recordDico(dico, contextGeo);
  const buildings = await contextGeo.getChildrenInContext();
  buildings.forEach(recordDico.bind(null, dico));
  for (let index = 0; index < cmds.length; index++) {
    const cmdArr = cmds[index];
    const proms: (() => Promise<void>)[] = [];
    for (const cmd of cmdArr) {
      if (cmd.type === 'floor') {
        proms.push(
          consumeNewUpdateCmd.bind(null, dico, cmd, contextGeo, addFloor)
        );
      } else if (cmd.type === 'floorRef') {
        proms.push(
          consumeNewUpdateRefCmd.bind(null, dico, cmd, REFERENCE_RELATION)
        );
      } else if (cmd.type === 'floorRefDel') {
        proms.push(consumeDeleteCmd.bind(null, dico, cmd, REFERENCE_RELATION));
      } else if (cmd.type === 'floorRoomDel') {
        proms.push(
          consumeDeleteCmd.bind(
            null,
            dico,
            cmd,
            ROOM_RELATION,
            nodeGenerationId,
            contextGenerationId
          )
        );
      } else if (cmd.type === 'room') {
        proms.push(
          consumeNewUpdateCmd.bind(null, dico, cmd, contextGeo, addRoom)
        );
      } else if (cmd.type === 'roomRef') {
        proms.push(
          consumeNewUpdateRefCmd.bind(null, dico, cmd, REFERENCE_ROOM_RELATION)
        );
      } else if (cmd.type === 'roomRefDel') {
        proms.push(
          consumeDeleteCmd.bind(null, dico, cmd, REFERENCE_ROOM_RELATION)
        );
      } else if (cmd.type === 'RefNode') {
        proms.push(consumeRefNode.bind(null, dico, cmd, contextGeo));
      }
    }
    await consumeBatch(proms, 10, (idx) => {
      try {
        if (callbackProg) callbackProg(index, idx);
      } catch (error) {
        console.error(error);
      }
    });
  }
}

async function getBimContext(
  dico: Record<string, Promise<SpinalNode>>,
  bimFileId: string
): Promise<SpinalNode> {
  const bimContext = dico[bimFileId];
  if (bimContext) return bimContext;
  dico[bimFileId] = new Promise((resolve, reject) => {
    getBimContextByBimFileId(bimFileId, true)
      .then((bimContext) => resolve(bimContext))
      .catch(reject);
  });
  return dico[bimFileId];
}

async function consumeRefNode(
  dico: Record<string, SpinalNode>,
  cmd: ICmdNew,
  contextGeo: SpinalContext
) {
  if (spinal.SHOW_LOG_GENERATION) console.log('consumeRef', cmd);
  const parentNode = dico[cmd.pNId];
  if (!parentNode) throw new Error(`ParentId for ${cmd.type} not found.`);
  // find id in parentChildren
  const children = await parentNode.getChildrenInContext(contextGeo);
  const child = children.find((node) => node.info.id.get() === cmd.id);
  recordDico(dico, child);
}

async function consumeDeleteCmd(
  dico: Record<string, SpinalNode>,
  cmd: ICmdNew,
  relationName: string,
  nodeGenerationId?: string,
  contextGenerationId?: string
): Promise<void> {
  if (spinal.SHOW_LOG_GENERATION) console.log('consumeDeleteCmd', cmd);
  const parentNode = dico[cmd.pNId];
  if (!parentNode) throw new Error(`ParentId for ${cmd.type} not found.`);
  const childrenNode = await parentNode.getChildren(relationName);
  const nodesToDel: SpinalNode[] = [];
  for (const id of cmd.nIdToDel) {
    const refChild = childrenNode.find((itm) => itm.info.id.get() === id);
    if (refChild) nodesToDel.push(refChild);
  }
  if (nodesToDel.length > 0) {
    await parentNode.removeChildren(
      nodesToDel,
      relationName,
      SPINAL_RELATION_PTR_LST_TYPE
    );

    if (nodeGenerationId) {
      const contextGeneration = getRealNode(nodeGenerationId);
      const nodeGeneration = getRealNode(contextGenerationId);
      const prom = nodesToDel.map((itm) => {
        return nodeGeneration.addChildInContext(
          itm,
          ARCHIVE_RELATION_NAME,
          SPINAL_RELATION_PTR_LST_TYPE,
          contextGeneration
        );
      });
      await Promise.all(prom);
    }
  }
}

function recordDico(dico: Record<string, SpinalNode>, node: SpinalNode): void {
  dico[node.info.id.get()] = node;
}

async function consumeNewUpdateCmd(
  dico: Record<string, SpinalNode>,
  cmd: ICmdNew,
  contextGeo: SpinalContext,
  createMtd: typeof addFloor | typeof addRoom
) {
  if (spinal.SHOW_LOG_GENERATION) console.log('consumeNewUpdateCmd', cmd);
  const parentNode = dico[cmd.pNId];
  if (!parentNode) throw new Error(`ParentId for ${cmd.type} not found.`);
  // find id in parentChildren
  const children = await parentNode.getChildrenInContext(contextGeo);
  let child = children.find((node) => node.info.id.get() === cmd.id);
  if (!child) {
    // id not found => create Child
    child = await createMtd(contextGeo, parentNode, cmd.name);
    if (cmd.id) updateInfoByKey(child, 'id', cmd.id);
  }
  // update the floor with cmd!
  // update info
  updateInfo(child, cmd.info);
  await updateAttr(child, cmd.attr); // update attr
  if (cmd.name) updateInfoByKey(child, 'name', cmd.name);
  recordDico(dico, child);
  await waitGetServerId(child);
}

async function createOrUpdateBimObjByBimFileId(
  dico: Record<string, SpinalNode>,
  id: string,
  bimFileId: string,
  name: string,
  dbId: number,
  externalId?: string
): Promise<SpinalNode> {
  const bimContext = await getBimContext(<any>dico, bimFileId);
  const bimobjs = await bimContext.getChildren(GEO_EQUIPMENT_RELATION);
  if (externalId) {
    for (const bimObj of bimobjs) {
      if (externalId === bimObj.info.externalId?.get()) {
        updateInfoByKey(bimObj, 'name', name);
        updateInfoByKey(bimObj, 'dbid', dbId);
        updateInfoByKey(bimObj, 'bimFileId', bimFileId);
        updateInfoByKey(bimObj, 'externalId', externalId);
        return bimObj;
      }
    }
  }
  for (const bimObj of bimobjs) {
    if (dbId === bimObj.info.dbid?.get()) {
      updateInfoByKey(bimObj, 'name', name);
      updateInfoByKey(bimObj, 'dbid', dbId);
      updateInfoByKey(bimObj, 'bimFileId', bimFileId);
      updateInfoByKey(bimObj, 'externalId', externalId);
      return bimObj;
    }
  }

  const bimObj = new SpinalNode(name, EQUIPMENT_TYPE);
  updateInfoByKey(bimObj, 'name', name);
  updateInfoByKey(bimObj, 'id', id);
  updateInfoByKey(bimObj, 'dbid', dbId);
  updateInfoByKey(bimObj, 'bimFileId', bimFileId);
  updateInfoByKey(bimObj, 'externalId', externalId);

  return bimContext.addChild(
    bimObj,
    GEO_EQUIPMENT_RELATION,
    SPINAL_RELATION_PTR_LST_TYPE
  );
}

async function consumeNewUpdateRefCmd(
  dico: Record<string, SpinalNode>,
  cmd: ICmdNew,
  relationName: string
) {
  if (spinal.SHOW_LOG_GENERATION) console.log('consumeNewUpdateRefCmd', cmd);
  const parentNode = dico[cmd.pNId];
  if (!parentNode) throw new Error(`ParentId for ${cmd.type} not found.`);
  // find id in parentChildren
  const children = await parentNode.getChildren(relationName);
  let child = children.find((node) => node.info.id.get() === cmd.id);
  if (!child) {
    // id not found => create Child
    child = await createOrUpdateBimObjByBimFileId(
      dico,
      cmd.id,
      cmd.info.bimFileId,
      cmd.name,
      cmd.info.dbid,
      cmd.info.externalId
    );
    for (const c of children) {
      if (c.info.id.get() === child.info.id.get()) return;
    }
    await parentNode.addChild(
      child,
      relationName,
      SPINAL_RELATION_PTR_LST_TYPE
    );
  }
  await waitGetServerId(child);
}
