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

import type { ICmdProjection } from '../../interfaces/ICmdProjection';
import type { ICmdMissing } from '../../interfaces/ICmdMissing';
import {
  SPINAL_RELATION_PTR_LST_TYPE,
  type SpinalContext,
  SpinalNode,
  SPINAL_RELATION_LST_PTR_TYPE,
} from 'spinal-model-graph';
import {
  getBimContextByBimFileId,
  getContextSpatial,
  getGraph,
  getRealNode,
  updateInfoByKey,
  waitGetServerId,
} from '../../utils';
import {
  GEO_BUILDING_RELATION,
  GEO_EQUIPMENT_RELATION,
  GEO_FLOOR_RELATION,
  GEO_ROOM_RELATION,
  GEO_ROOM_TYPE,
  GEO_SITE_RELATION,
  GEO_ZONE_RELATION,
} from '../../../Constant';
import { EQUIPMENT_TYPE } from 'spinal-env-viewer-context-geographic-service';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { consumeBatch } from '../../../utils/consumeBatch';
import throttle from 'lodash.throttle';
type RecordSpinalNode = Record<string, Promise<SpinalNode>>;
type TAsyncGenNodeGeneration = AsyncGenerator<
  {
    node: SpinalNode;
    children: SpinalNode[];
  },
  never,
  never
>;

export async function consumeCmdProjection(
  cmds: (ICmdMissing | ICmdProjection)[],
  nodeId: string,
  contextId: string,
  callbackProg?: (index: number) => void,
  consumeBatchSize = 20
): Promise<void> {
  const contextGeneration = getRealNode(contextId);
  const nodeGeneration = getRealNode(nodeId);
  const warnNodeGen = getOrCreateGenOutNode(
    contextGeneration,
    nodeGeneration,
    'warn'
  );
  const errorNodeGen = getOrCreateGenOutNode(
    contextGeneration,
    nodeGeneration,
    'error'
  );
  const dico: RecordSpinalNode = {};
  const graph = getGraph();
  const contextGeo = await getContextSpatial(graph);
  const cb = throttle(callbackProg, 100);
  recordDico(dico, contextGeo);
  await contextGeo.find(
    [
      GEO_SITE_RELATION,
      GEO_BUILDING_RELATION,
      GEO_FLOOR_RELATION,
      GEO_ROOM_RELATION,
      GEO_ZONE_RELATION,
    ],
    (node) => {
      if (node.info.type.get() === GEO_ROOM_TYPE) {
        recordDico(dico, node);
        return true;
      }
      return false;
    }
  );
  if (callbackProg) callbackProg(10);
  const totalIteration = cmds.reduce((acc, cmd) => {
    return acc + cmd.data.length;
  }, 0);
  const proms: (() => Promise<void>)[] = [];
  let totalIt = 0;
  for (let idx = 0; idx < cmds.length; idx++) {
    const cmd = cmds[idx];
    const bimContext = await getBimContext(dico, cmd.bimFileId);
    const bimobjs = await bimContext.getChildren(GEO_EQUIPMENT_RELATION);
    if (isCmdProj(cmd)) {
      proms.push(
        consumeCmdProj.bind(
          this,
          dico,
          cmd,
          contextGeo,
          () => {
            cb((++totalIt / totalIteration) * 90 + 10);
          },
          bimContext,
          bimobjs,
          warnNodeGen,
          contextGeneration
        )
      );
    } else {
      proms.push(
        consumeCmdMissingProj.bind(
          this,
          errorNodeGen,
          contextGeo,
          cmd,
          bimContext,
          bimobjs,
          contextGeneration,
          () => {
            cb((++totalIt / totalIteration) * 90 + 10);
          }
        )
      );
    }
  }
  await consumeBatch(proms, consumeBatchSize);
}

async function* getOrCreateGenOutNode(
  contextGeneration: SpinalContext,
  nodeGeneration: SpinalNode,
  type: 'warn' | 'error'
): TAsyncGenNodeGeneration {
  let resNode: SpinalNode;
  const nodes = await nodeGeneration.getChildrenInContext(contextGeneration);
  for (const node of nodes) {
    if (type === 'warn' && node.info.name.get() === 'warn') {
      resNode = node;
    } else if (type === 'error' && node.info.name.get() === 'error') {
      resNode = node;
    }
  }
  if (!resNode) {
    resNode = new SpinalNode(type, `GenerationContextType`);
    nodeGeneration.addChildInContext(
      resNode,
      'hasGenerationContextType',
      SPINAL_RELATION_PTR_LST_TYPE,
      contextGeneration
    );
  }
  const children = await resNode.getChildrenInContext(contextGeneration);
  while (true) yield { node: resNode, children };
}

async function consumeCmdMissingProj(
  errorGen: TAsyncGenNodeGeneration,
  contextGeo: SpinalContext,
  cmd: ICmdMissing,
  bimContext: SpinalNode,
  bimobjs: SpinalNode[],
  contextGeneration: SpinalContext,
  callbackProg: () => void
) {
  if (spinal.SHOW_LOG_GENERATION) console.log('consumeCmdMissingProj', cmd);
  const nodeGeneration = (await errorGen.next()).value;
  for (const obj of cmd.data) {
    if (spinal.SHOW_LOG_GENERATION) console.log(' => ', obj);
    let child = nodeGeneration.children.find(
      (node) => node.info.externalId.get() === obj.externalId
    );
    if (child) {
      updateBimObjInfo(
        child,
        obj.name,
        obj.dbid,
        cmd.bimFileId,
        obj.externalId
      );
    } else {
      child = await createOrUpdateBimObj(
        bimContext,
        bimobjs,
        cmd.bimFileId,
        obj.name,
        obj.dbid,
        obj.externalId
      );
      await nodeGeneration.node.addChildInContext(
        child,
        GEO_EQUIPMENT_RELATION,
        SPINAL_RELATION_PTR_LST_TYPE,
        contextGeneration
      );
      await updateRevitCategory(child, obj.revitCat, obj.centerPos);
    }
    await removeOtherParents(child, contextGeo, '');
    await removeOtherParents(
      child,
      contextGeneration,
      nodeGeneration.node.info.id.get()
    );
    await waitGetServerId(child);
    if (callbackProg) callbackProg();
  }
}

async function consumeCmdProj(
  dico: RecordSpinalNode,
  cmd: ICmdProjection,
  contextGeo: SpinalContext,
  callbackProg: () => void,
  bimContext: SpinalNode,
  bimobjs: SpinalNode[],
  warnGen: TAsyncGenNodeGeneration,
  contextGeneration: SpinalContext
) {
  if (spinal.SHOW_LOG_GENERATION) console.log('consumeCmdProj', cmd);

  const parentNode = await getFromDico(dico, cmd.pNId);
  if (!parentNode) throw new Error(`ParentId for ${cmd.type} not found.`);
  const children = await parentNode.getChildrenInContext(contextGeo);
  for (const obj of cmd.data) {
    if (spinal.SHOW_LOG_GENERATION) console.log(' => ', obj);
    let child = children.find(
      (node) => node.info.externalId.get() === obj.externalId
    );
    if (child) {
      updateBimObjInfo(
        child,
        obj.name,
        obj.dbid,
        cmd.bimFileId,
        obj.externalId
      );
    } else {
      child = await createOrUpdateBimObj(
        bimContext,
        bimobjs,
        cmd.bimFileId,
        obj.name,
        obj.dbid,
        obj.externalId
      );
      await parentNode.addChildInContext(
        child,
        GEO_EQUIPMENT_RELATION,
        SPINAL_RELATION_PTR_LST_TYPE,
        contextGeo
      );
    }
    await removeOtherParents(child, contextGeo, parentNode.info.id.get());
    await removeOtherParents(child, contextGeneration, '');
    await updateRevitCategory(child, obj.revitCat, obj.centerPos);
    if (obj.flagWarining) {
      const nodeGeneration = (await warnGen.next()).value;
      let childGen = nodeGeneration.children.find(
        (node) => node.info.externalId.get() === obj.externalId
      );
      if (!childGen) {
        childGen = await createOrUpdateBimObj(
          bimContext,
          bimobjs,
          cmd.bimFileId,
          obj.name,
          obj.dbid,
          obj.externalId
        );
        await nodeGeneration.node.addChildInContext(
          childGen,
          GEO_EQUIPMENT_RELATION,
          SPINAL_RELATION_PTR_LST_TYPE,
          contextGeneration
        );
      }
      await removeOtherParents(
        child,
        contextGeneration,
        nodeGeneration.node.info.id.get()
      );
    }
    await waitGetServerId(child);
    if (callbackProg) callbackProg();
  }
}

async function updateRevitCategory(
  child: SpinalNode,
  revitCat: string,
  centerPos: string
) {
  if (!revitCat) return;
  let cat = await attributeService.getCategoryByName(child, 'Spatial');
  if (!cat) {
    cat = await attributeService.addCategoryAttribute(child, 'Spatial');
  }
  const attrsFromNode = await attributeService.getAttributesByCategory(
    child,
    cat
  );
  const revitCatAttr = attrsFromNode.find(
    (itm) => itm.label.get() === 'revit_category'
  );
  if (revitCatAttr) {
    revitCatAttr.value.set(revitCat);
  } else {
    attributeService.addAttributeByCategory(
      child,
      cat,
      'revit_category',
      revitCat,
      '',
      ''
    );
  }
  if (centerPos) {
    const centerPosAttr = attrsFromNode.find(
      (itm) => itm.label.get() === 'XYZ center'
    );
    if (centerPosAttr) {
      centerPosAttr.value.set(centerPos);
    } else {
      attributeService.addAttributeByCategory(
        child,
        cat,
        'XYZ center',
        centerPos,
        '',
        ''
      );
    }
  }
}

async function removeOtherParents(
  child: SpinalNode,
  context: SpinalContext,
  parentNodeId: string
) {
  const parents = await child.getParentsInContext(context);
  const toRm: SpinalNode[] = [];
  try {
    for (const otherParent of parents) {
      if (otherParent.info.id.get() !== parentNodeId) {
        toRm.push(otherParent);
      }
    }
    for (const obj of toRm) {
      if (obj.children.LstPtr?.[GEO_EQUIPMENT_RELATION]) {
        try {
          await obj.removeChild(
            child,
            GEO_EQUIPMENT_RELATION,
            SPINAL_RELATION_LST_PTR_TYPE
          );
        } catch (e) {
          await obj.removeChild(
            child,
            GEO_EQUIPMENT_RELATION,
            SPINAL_RELATION_PTR_LST_TYPE
          );
        }
      } else {
        await obj.removeChild(
          child,
          GEO_EQUIPMENT_RELATION,
          SPINAL_RELATION_PTR_LST_TYPE
        );
      }
    }
  } catch (error) {
    console.error(error);
    console.log('trying to removeOtherParents', {
      child,
      context,
      parentNodeId,
    });
  }
}

function recordDico(dico: RecordSpinalNode, node: SpinalNode): void {
  dico[node.info.id.get()] = Promise.resolve(node);
}
function getFromDico(dico: RecordSpinalNode, id: string): Promise<SpinalNode> {
  return dico[id];
}

function isCmdProj(item: ICmdMissing | ICmdProjection): item is ICmdProjection {
  return item.type === 'CmdProjection';
}
async function getBimContext(dico: RecordSpinalNode, bimFileId: string) {
  const bimContext = getFromDico(dico, bimFileId);
  if (bimContext) return bimContext;
  dico[bimFileId] = new Promise((resolve, reject) => {
    getBimContextByBimFileId(bimFileId, true)
      .then((bimContext) => resolve(bimContext))
      .catch(reject);
  });
  return getFromDico(dico, bimFileId);
}

async function createOrUpdateBimObj(
  bimContext: SpinalContext,
  bimobjs: SpinalNode[],
  bimFileId: string,
  name: string,
  dbid: number,
  externalId?: string
): Promise<SpinalNode> {
  if (externalId) {
    for (const bimObj of bimobjs) {
      if (externalId === bimObj.info.externalId?.get()) {
        updateBimObjInfo(bimObj, name, dbid, bimFileId, externalId);
        return bimObj;
      }
    }
  }
  for (const bimObj of bimobjs) {
    if (dbid === bimObj.info.dbid?.get()) {
      updateBimObjInfo(bimObj, name, dbid, bimFileId, externalId);
      return bimObj;
    }
  }

  const bimObj = new SpinalNode(name, EQUIPMENT_TYPE);
  updateBimObjInfo(bimObj, name, dbid, bimFileId, externalId);

  return bimContext.addChild(
    bimObj,
    GEO_EQUIPMENT_RELATION,
    SPINAL_RELATION_PTR_LST_TYPE
  );
}
function updateBimObjInfo(
  bimObj: SpinalNode,
  name: string,
  dbid: number,
  bimFileId: string,
  externalId: string
) {
  updateInfoByKey(bimObj, 'name', name);
  updateInfoByKey(bimObj, 'dbid', dbid);
  updateInfoByKey(bimObj, 'bimFileId', bimFileId);
  updateInfoByKey(bimObj, 'externalId', externalId);
}
