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

import type { ICmdNew, ICmdNewSpace } from '../../interfaces/ICmdNew';
import {
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
  SpinalContext,
} from 'spinal-model-graph';
import { getContextSpatial } from '../../utils/getContextSpatial';
import {
  EQUIPMENT_TYPE,
  REFERENCE_RELATION,
  REFERENCE_ROOM_RELATION,
  ROOM_RELATION,
  addBuilding,
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
import { GEO_EQUIPMENT_RELATION, GEO_ROOM_RELATION } from '../../../Constant';
import { SpinalNodeFloor } from '../../mergeBimGeo/SpinalNodeFloor';

export async function consumeCmdGeo(
  cmds: ICmdNew[][],
  nodeGenerationId: string,
  contextGenerationId: string,
  callbackProg?: (indexCmd: number, idxInCmd: number) => void,
  consumeBatchSize = 20
) {
  const graph = getGraph();
  const contextGeo = await getContextSpatial(graph);
  const dico: Record<string, SpinalNode> = {};
  recordDico(dico, contextGeo);
  const buildings = await contextGeo.getChildrenInContext();
  const contexts = await graph.getChildren();
  contexts.forEach(recordDico.bind(null, dico));
  buildings.forEach(recordDico.bind(null, dico));
  for (let index = 0; index < cmds.length; index++) {
    const cmdArr = cmds[index];
    const proms: (() => Promise<void>)[] = [];
    let isFloors = false;
    for (const cmd of cmdArr) {
      if (cmd.type === 'building') {
        proms.push(consumeNewUpdateCmd.bind(null, dico, cmd, addBuilding));
      } else if (cmd.type === 'floor') {
        proms.push(consumeNewUpdateCmd.bind(null, dico, cmd, addFloor));
        isFloors = true;
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
        proms.push(consumeNewUpdateCmd.bind(null, dico, cmd, addRoom));
      } else if (cmd.type === 'roomRef') {
        proms.push(
          consumeNewUpdateRefCmd.bind(null, dico, cmd, REFERENCE_ROOM_RELATION)
        );
      } else if (cmd.type === 'roomRefDel') {
        proms.push(
          consumeDeleteCmd.bind(null, dico, cmd, REFERENCE_ROOM_RELATION)
        );
      } else if (cmd.type === 'RefNode') {
        proms.push(consumeRefNode.bind(null, dico, cmd));
      }
    }
    await consumeBatch(proms, isFloors ? 1 : consumeBatchSize, (idx) => {
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

async function consumeRefNode(dico: Record<string, SpinalNode>, cmd: ICmdNew) {
  if (spinal.SHOW_LOG_GENERATION) console.log('consumeRef', cmd);
  const parentNode = dico[cmd.pNId];
  if (!parentNode) throw new Error(`ParentId for ${cmd.type} not found.`);
  const context = dico[cmd.contextId];
  if (!context)
    throw new Error(`contextId [${cmd.contextId}] for ${cmd.type} not found.`);
  // find id in parentChildren
  const children = await parentNode.getChildrenInContext(context);
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
    if (nodeGenerationId) {
      const contextGeneration = getRealNode(contextGenerationId);
      const nodeGeneration = getRealNode(nodeGenerationId);
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
    await parentNode.removeChildren(
      nodesToDel,
      relationName,
      SPINAL_RELATION_PTR_LST_TYPE
    );
  }
}

function recordDico(dico: Record<string, SpinalNode>, node: SpinalNode): void {
  dico[node.info.id.get()] = node;
}

async function consumeNewUpdateCmd(
  dico: Record<string, SpinalNode>,
  cmd: ICmdNewSpace,
  createMtd: typeof addFloor | typeof addRoom
) {
  if (spinal.SHOW_LOG_GENERATION) console.log('consumeNewUpdateCmd', cmd);
  const parentNode = dico[cmd.pNId];
  if (!parentNode) throw new Error(`ParentId for ${cmd.type} not found.`);
  const context = dico[cmd.contextId];
  if (!context)
    throw new Error(`contextId [${cmd.contextId}] for ${cmd.type} not found.`);

  // find id in parentChildren
  const children = await parentNode.getChildrenInContext(context);
  let child: SpinalNodeFloor = children.find(
    (node) => node.info.id.get() === cmd.id
  );
  if (!child) {
    // id not found => create Child
    child = await createMtd(context, parentNode, cmd.name, cmd.id);
  }
  // update the floor with cmd!
  // update info
  if (cmd.info) updateInfo(child, cmd.info);
  await updateAttr(child, cmd.attr); // update attr
  if (cmd.name) updateInfoByKey(child, 'name', cmd.name);
  // Update linkedBimGeos
  await handleLinkedBimGeosInfo(cmd, child, context);
  recordDico(dico, child);
  await removeFromContextGen(child);
  await waitGetServerId(child);
}

async function handleLinkedBimGeosInfo(
  cmd: ICmdNewSpace,
  floorNode: SpinalNodeFloor,
  contextGeo: SpinalContext
) {
  if (!cmd.linkedBimGeos) {
    return;
  }
  // update child.info.linkedBimGeos
  if (typeof floorNode.info.linkedBimGeos === 'undefined') {
    floorNode.info.add_attr('linkedBimGeos', cmd.linkedBimGeos);
  } else {
    const toRm = [];
    let found = false;
    for (const item of cmd.linkedBimGeos) {
      for (const itmNode of floorNode.info.linkedBimGeos) {
        if (
          itmNode.contextId.get() === item.contextId &&
          itmNode.floorId.get() === item.floorId
        ) {
          found = true;
          break;
        }
      }
      if (!found) {
        floorNode.info.linkedBimGeos.push({
          floorId: item.floorId,
          contextId: item.contextId,
        });
      }
    }

    for (const item of floorNode.info.linkedBimGeos) {
      if (
        !cmd.linkedBimGeos.some(
          (itm) =>
            itm.contextId === item.contextId.get() &&
            itm.floorId === item.floorId.get()
        )
      ) {
        toRm.push(item);
      }
    }
    for (const itm of toRm) {
      const idx = floorNode.info.linkedBimGeos.indexOf_ref(itm);
      if (idx != -1) floorNode.info.linkedBimGeos.splice(idx, 1);
    }
  }
  // update child node children
  const promUpRoom = updateLinkedBimGeoFloorNode(floorNode, contextGeo, cmd);
  const promUpRef = updateLinkedBimGeoFloorNodeRef(floorNode, cmd);
  await Promise.all([promUpRoom, promUpRef]);
}

async function updateLinkedBimGeoFloorNode(
  floorNode: SpinalNodeFloor,
  contextGeo: SpinalContext,
  cmd: ICmdNewSpace
) {
  const roomNodes = await floorNode.getChildrenInContext(contextGeo);
  if (cmd.linkedBimGeos.length === 0 && roomNodes.length > 0) {
    return floorNode.removeChildren(
      roomNodes,
      GEO_ROOM_RELATION,
      SPINAL_RELATION_PTR_LST_TYPE
    );
  }
  const roomIdsSeen = new Set<string>();
  for (const item of cmd.linkedBimGeos) {
    const bimContext = getRealNode(item.contextId);
    if (!bimContext) {
      console.error(
        `Unknown linkedBimGeos contextId [${
          item.contextId
        }] for floor node ${floorNode.info.name.get()}`
      );
      continue;
    }
    // get floor
    const bimFloorNodes = await bimContext.getChildrenInContext(bimContext);
    const bimFloorNode = bimFloorNodes.find(
      (itm) => itm.info.id.get() === item.floorId
    );
    if (!bimFloorNode) {
      console.error(
        `Unknown linkedBimGeos bimFloorNode [${
          item.floorId
        }] from ${bimContext.info.name.get()} context to link to floor node ${floorNode.info.name.get()}`
      );
      continue;
    }
    // get rooms
    const bimRoomNodes = await bimFloorNode.getChildrenInContext(bimContext);
    bimRoomNodes.forEach((room) => roomIdsSeen.add(room.info.id.get()));
    // get room to add
    const roomsToAdd = bimRoomNodes.filter((nodeBim) => {
      return !roomNodes.some(
        (nodeGeo) => nodeGeo.info.id.get() === nodeBim.info.id.get()
      );
    });
    // add room to add to floorNode
    const proms = roomsToAdd.map((roomToAdd) =>
      floorNode.addChildInContext(
        roomToAdd,
        GEO_ROOM_RELATION,
        SPINAL_RELATION_PTR_LST_TYPE,
        contextGeo
      )
    );
    await Promise.all(proms);
  }
  const nodesToRm = roomNodes.reduce(
    (result: SpinalNode[], nodeGeo: SpinalNode) => {
      if (!roomIdsSeen.has(nodeGeo.info.id.get())) {
        result.push(nodeGeo);
      }
      return result;
    },
    []
  );
  if (nodesToRm.length > 0) {
    await floorNode.removeChildren(
      nodesToRm,
      GEO_ROOM_RELATION,
      SPINAL_RELATION_PTR_LST_TYPE
    );
  }
}

async function updateLinkedBimGeoFloorNodeRef(
  targetFloorNode: SpinalNodeFloor,
  cmd: ICmdNewSpace
) {
  const targetFloorRefs = await targetFloorNode.getChildren(REFERENCE_RELATION);
  // remove all if cmd.linkedBimGeos.length === 0
  if (cmd.linkedBimGeos.length === 0 && targetFloorRefs.length > 0) {
    return targetFloorNode.removeChildren(
      targetFloorRefs,
      GEO_ROOM_RELATION,
      SPINAL_RELATION_PTR_LST_TYPE
    );
  }
  const refIdsSeen = new Set<string>();
  for (const item of cmd.linkedBimGeos) {
    const bimContext = getRealNode(item.contextId);
    if (!bimContext) {
      console.error(
        `Unknown linkedBimGeos contextId [${
          item.contextId
        }] for floor node ${targetFloorNode.info.name.get()}`
      );
      continue;
    }
    // get floor
    const bimFloorNodes = await bimContext.getChildrenInContext(bimContext);
    const bimFloorNode = bimFloorNodes.find(
      (itm) => itm.info.id.get() === item.floorId
    );
    if (!bimFloorNode) {
      console.error(
        `Unknown linkedBimGeos bimFloorNode [${
          item.floorId
        }] from ${bimContext.info.name.get()} context to link to floor node ${targetFloorNode.info.name.get()}`
      );
      continue;
    }
    // get floor refs
    const bimFloorRefNodes = await bimFloorNode.getChildren(REFERENCE_RELATION);
    bimFloorRefNodes.forEach((ref) => refIdsSeen.add(ref.info.id.get()));
    // get floor refs to add
    const refsToAdd = bimFloorRefNodes.filter((nodeBim) => {
      return !targetFloorRefs.some(
        (nodeGeo) => nodeGeo.info.id.get() === nodeBim.info.id.get()
      );
    });
    // add floor refs to add to floorNode
    const proms = refsToAdd.map((refToAdd) =>
      targetFloorNode.addChild(
        refToAdd,
        REFERENCE_RELATION,
        SPINAL_RELATION_PTR_LST_TYPE
      )
    );
    await Promise.all(proms);
  }

  const nodesToRm = targetFloorRefs.reduce(
    (result: SpinalNode[], refNode: SpinalNode) => {
      if (!refIdsSeen.has(refNode.info.id.get())) {
        result.push(refNode);
      }
      return result;
    },
    []
  );
  if (nodesToRm.length > 0) {
    await targetFloorNode.removeChildren(
      nodesToRm,
      REFERENCE_RELATION,
      SPINAL_RELATION_PTR_LST_TYPE
    );
  }
}

async function removeFromContextGen(roomNode: SpinalNode) {
  const parents = await roomNode.getParents(ARCHIVE_RELATION_NAME);
  await Promise.all(
    parents.map((parent) => {
      return parent.removeChild(
        roomNode,
        ARCHIVE_RELATION_NAME,
        SPINAL_RELATION_PTR_LST_TYPE
      );
    })
  );
}

async function createOrUpdateBimObjByBimFileId(
  dico: Record<string, SpinalNode>,
  id: string,
  bimFileId: string,
  name: string,
  dbId: number,
  externalId?: string
): Promise<SpinalNode> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
