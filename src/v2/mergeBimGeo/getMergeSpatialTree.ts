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

import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { getRealNode } from '../utils';
import { GEO_FLOOR_TYPE } from '../../Constant';
import { ITreeItem, ETreeItemStatus } from './ITreeItem';
import { BIM_GEO_FLOOR_PART_TYPE } from '../constant';
import { SpinalNodeFloor } from './SpinalNodeFloor';

export async function getMergeSpatialTree(contextGeoId: string) {
  const contextGeo: SpinalContext = getRealNode(contextGeoId);
  const contextItem: ITreeItem = {
    id: contextGeo.info.id.get(),
    name: contextGeo.info.name.get(),
    type: contextGeo.info.type.get(),
    status: ETreeItemStatus.normal,
    contextId: contextGeo.info.id.get(),
    children: [],
  };
  const res: ITreeItem[] = [contextItem];

  await handleSpatialCreateTreeRec(
    contextItem.children,
    contextGeo,
    contextGeo
  );
  return res;
}

async function handleSpatialCreateTreeRec(
  targetArr: ITreeItem[],
  contextGeo: SpinalContext,
  child: SpinalNode
) {
  if (isSpinalNodeTypeFloor(child)) {
    return getBimContextLinked(targetArr, child);
  }
  const children = await child.getChildrenInContext(contextGeo);
  for (const child of children) {
    const childData: ITreeItem = {
      id: child.info.id.get(),
      name: child.info.name.get(),
      type: child.info.type.get(),
      contextId: contextGeo.info.id.get(),
      status: ETreeItemStatus.normal,
      children: [],
    };
    targetArr.push(childData);
    await handleSpatialCreateTreeRec(childData.children, contextGeo, child);
  }
}

function isSpinalNodeTypeFloor(node: SpinalNode): node is SpinalNodeFloor {
  return node.info.type.get() === GEO_FLOOR_TYPE;
}

async function getBimContextLinked(
  targetArr: ITreeItem[],
  child: SpinalNodeFloor
) {
  if (typeof child.info.linkedBimGeos === 'undefined') return;
  for (const linkedBimGeo of child.info.linkedBimGeos) {
    const contextId = linkedBimGeo.contextId.get();
    const floorId = linkedBimGeo.floorId.get();
    const name = await getFloorName(contextId, floorId);

    targetArr.push({
      id: floorId,
      name,
      contextId,
      type: BIM_GEO_FLOOR_PART_TYPE,
      inGeoContext: true,
      status:
        name === 'unknown' ? ETreeItemStatus.unknown : ETreeItemStatus.normal,
      startStatus:
        name === 'unknown' ? ETreeItemStatus.unknown : ETreeItemStatus.normal,
      children: [],
    });
  }
}

async function getFloorName(contextId: string, floorId: string) {
  const context = getRealNode(contextId);
  const children = await context.getChildrenInContext(context);
  for (const child of children) {
    if (child.info.id.get() === floorId) return child.info.name.get();
  }
  return 'unknown';
}
