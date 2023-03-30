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
import { SpinalNode, SpinalContext } from 'spinal-model-graph';
import { SPINAL_RELATION_PTR_LST_TYPE } from 'spinal-model-graph';
import { getContextSpatial } from '../../utils/getContextSpatial';
import {
  REFERENCE_RELATION,
  REFERENCE_ROOM_RELATION,
  ROOM_RELATION,
  addFloor,
  addRoom,
} from 'spinal-env-viewer-context-geographic-service';
import { consumeBatch } from '../../../utils/consumeBatch';
import { updateAttr } from '../../utils/updateAttr';
import { updateInfo } from '../../utils/updateInfo';
import { updateInfoByKey } from '../../utils/updateInfoByKey';
import { getGraph, getRealNode } from '../../utils/graphservice';
import { waitGetServerId } from '../../utils/waitGetServerId';
import { getBimContextByBimFileId } from '../../utils/getBimContextByBimFileId';
import {
  ARCHIVE_RELATION_NAME,
  ARCHIVE_GROUPE_TYPE,
  ARCHIVE_GROUPE_REL,
  ARCHIVE_CONTEXT_NAME,
  ARCHIVE_CONTEXT_TYPE,
} from '../../../Constant';

export async function handleCmd(
  cmds: ICmdNew[][],
  name: string,
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
          handleNewUpdateCmd.bind(null, dico, cmd, contextGeo, addFloor)
        );
      } else if (cmd.type === 'floorRef') {
        proms.push(
          handleNewUpdateRefCmd.bind(null, dico, cmd, REFERENCE_RELATION)
        );
      } else if (cmd.type === 'floorRefDel') {
        proms.push(handleDeleteCmd.bind(null, dico, cmd, REFERENCE_RELATION));
      } else if (cmd.type === 'floorRoomDel') {
        proms.push(handleDeleteCmd.bind(null, dico, cmd, ROOM_RELATION, name));
      } else if (cmd.type === 'room') {
        proms.push(
          handleNewUpdateCmd.bind(null, dico, cmd, contextGeo, addRoom)
        );
      } else if (cmd.type === 'roomRef') {
        proms.push(
          handleNewUpdateRefCmd.bind(null, dico, cmd, REFERENCE_ROOM_RELATION)
        );
      } else if (cmd.type === 'roomRefDel') {
        proms.push(
          handleDeleteCmd.bind(null, dico, cmd, REFERENCE_ROOM_RELATION)
        );
      } else if (cmd.type === 'RefNode') {
        proms.push(handleRefNode.bind(null, dico, cmd, contextGeo));
      }
    }
    await consumeBatch(proms, 1, (idx) => {
      try {
        if (callbackProg) callbackProg(index, idx);
      } catch (error) {
        console.error(error);
      }
    });
  }
}

async function getBimContext(
  dico: Record<string, SpinalNode>,
  bimFileId: string
) {
  let bimContext = dico[bimFileId];
  if (bimContext) return bimContext;
  bimContext = await getBimContextByBimFileId(bimFileId, true);
  dico[bimFileId] = bimContext;
  return bimContext;
}

async function handleRefNode(
  dico: Record<string, SpinalNode>,
  cmd: ICmdNew,
  contextGeo: SpinalContext
) {
  if (spinal.SHOW_LOG_GENERATION) console.log('handleRef', cmd);
  const parentNode = dico[cmd.pNId];
  if (!parentNode) throw new Error(`ParentId for ${cmd.type} not found.`);
  // find id in parentChildren
  const children = await parentNode.getChildrenInContext(contextGeo);
  const child = children.find((node) => node.info.id.get() === cmd.id);
  recordDico(dico, child);
}

async function handleDeleteCmd(
  dico: Record<string, SpinalNode>,
  cmd: ICmdNew,
  relationName: string,
  archiveName?: string
): Promise<void> {
  if (spinal.SHOW_LOG_GENERATION) console.log('handleDeleteCmd', cmd);
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

    if (archiveName) {
      const { context, archive } = await getOrCreateArchive(archiveName);
      const prom = nodesToDel.map((itm) => {
        return archive.addChildInContext(
          itm,
          ARCHIVE_RELATION_NAME,
          SPINAL_RELATION_PTR_LST_TYPE,
          context
        );
      });
      await Promise.all(prom);
    }
  }
}

async function getOrCreateArchive(archiveName: string) {
  const graph = getGraph();
  let context = await graph.getContext(ARCHIVE_CONTEXT_NAME);
  if (!context)
    context = new SpinalContext(ARCHIVE_CONTEXT_NAME, ARCHIVE_CONTEXT_TYPE);
  await graph.addContext(context);
  const children = await context.getChildrenInContext(context);
  for (const child of children) {
    if (child.info.name.get() === archiveName) {
      return {
        context,
        archive: child,
      };
    }
  }
  const archive = new SpinalNode(archiveName, ARCHIVE_GROUPE_TYPE);
  await context.addChildInContext(
    archive,
    ARCHIVE_GROUPE_REL,
    SPINAL_RELATION_PTR_LST_TYPE,
    context
  );
  return { context, archive };
}

function recordDico(dico: Record<string, SpinalNode>, node: SpinalNode): void {
  dico[node.info.id.get()] = node;
}

async function handleNewUpdateCmd(
  dico: Record<string, SpinalNode>,
  cmd: ICmdNew,
  contextGeo: SpinalContext,
  createMtd: typeof addFloor | typeof addRoom
) {
  if (spinal.SHOW_LOG_GENERATION) console.log('handleNewUpdateCmd', cmd);
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

export async function getBimFileByBimFileId(
  bimFileId: string
): Promise<SpinalNode> {
  const bimFile = getRealNode(bimFileId);
  if (bimFile) return bimFile;
  const graph = getGraph();
  const context = await graph.getContext('BimFileContext');
  if (!context) throw new Error('BimFileContext not found in graph');
  const child = await context.getChild(
    (node) => node.info.id.get() === bimFileId,
    'hasBimFile',
    SPINAL_RELATION_PTR_LST_TYPE
  );
  if (child) return child;
  throw new Error(`BimFileId [${bimFileId}] not found`);
}

async function createOrUpdateBimObjByBimFileId(
  dico: Record<string, SpinalNode>,
  id: string,
  bimFileId: string,
  name: string,
  dbId: number,
  externalId?: string
): Promise<SpinalNode> {
  const bimContext = await getBimContext(dico, bimFileId);
  const bimobjs = await bimContext.getChildren('hasBimObject');
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

  const bimObj = new SpinalNode(name, 'BIMObject');
  updateInfoByKey(bimObj, 'name', name);
  updateInfoByKey(bimObj, 'id', id);
  updateInfoByKey(bimObj, 'dbid', dbId);
  updateInfoByKey(bimObj, 'bimFileId', bimFileId);
  updateInfoByKey(bimObj, 'externalId', externalId);

  return bimContext.addChild(
    bimObj,
    'hasBimObject',
    SPINAL_RELATION_PTR_LST_TYPE
  );
}

async function handleNewUpdateRefCmd(
  dico: Record<string, SpinalNode>,
  cmd: ICmdNew,
  relationName: string
) {
  if (spinal.SHOW_LOG_GENERATION) console.log('handleNewUpdateRefCmd', cmd);
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
