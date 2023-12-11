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

import type { SpinalContext } from 'spinal-model-graph';
import { BIM_GEO_CONTEXT_TYPE, BIM_GEO_FLOOR_PART_TYPE } from '../constant';
import { getGraph } from '../utils';
import { ETreeItemStatus, type ITreeItem } from './ITreeItem';

function getBimGeoItems(
  mapBimGeoInSpatial: Map<string, ITreeItem>,
  spatialTree: ITreeItem[]
) {
  for (const child of spatialTree) {
    if (child.type === BIM_GEO_FLOOR_PART_TYPE) {
      mapBimGeoInSpatial.set(child.id, child);
    } else {
      getBimGeoItems(mapBimGeoInSpatial, child.children);
    }
  }
}

export async function getMergeBimGeoTrees(spatialTree: ITreeItem[]) {
  const res: ITreeItem[] = [];
  const graph = getGraph();
  const contexts: SpinalContext[] = await graph.getChildren();
  const bimGeoContexts = contexts.filter(
    (context) => context.info.type.get() === BIM_GEO_CONTEXT_TYPE
  );
  const mapBimGeoInSpatial: Map<string, ITreeItem> = new Map();
  getBimGeoItems(mapBimGeoInSpatial, spatialTree);
  const promises = bimGeoContexts.map((context) => {
    return context.getChildrenInContext(context).then((children) => {
      return {
        context,
        children,
      };
    });
  });
  const items = await Promise.all(promises);
  for (const { context, children } of items) {
    const itemRes: ITreeItem = {
      id: context.info.id.get(),
      contextId: context.info.id.get(),
      name: context.info.name.get(),
      type: context.info.type.get(),
      status: ETreeItemStatus.normal,
      children: children.map((floorNode) => {
        return (
          mapBimGeoInSpatial.get(floorNode.info.id.get()) || {
            id: floorNode.info.id.get(),
            contextId: context.info.id.get(),
            name: floorNode.info.name.get(),
            type: BIM_GEO_FLOOR_PART_TYPE,
            status: ETreeItemStatus.normal,
            startStatus: ETreeItemStatus.normal,
            inGeoContext: false,
            children: [],
          }
        );
      }),
    };
    res.push(itemRes);
  }
  return res;
}
