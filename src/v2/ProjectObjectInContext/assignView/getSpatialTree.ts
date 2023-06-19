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

import { GEO_REFERENCE_ROOM_RELATION } from '../../../Constant';
import { addNodeGraphService, getContextSpatial, getGraph } from '../../utils';
interface IAggregateSetDbidByBimFileId {
  bimFileId: string;
  dbId: Set<number>;
}
interface ISpatialTreeNode {
  type: string;
  id: string;
  name: string;
  server_id: number;
  children: ISpatialTreeNode[];
  data?: IAggregateSetDbidByBimFileId[];
}

export async function getSpatialTree(): Promise<ISpatialTreeNode[]> {
  const graph = getGraph();
  const spatialContext = await getContextSpatial(graph);
  const buildings = await spatialContext.getChildrenInContext(spatialContext);
  const proms: Promise<ISpatialTreeNode>[] = buildings.map(async (building) => {
    const floors = await building.getChildrenInContext(spatialContext);
    const buildingChildren = floors.map(async (floor) => {
      const rooms = await floor.getChildrenInContext(spatialContext);
      const roomDatas: Promise<ISpatialTreeNode>[] = rooms.map(async (room) => {
        addNodeGraphService(room);
        // to preload roomrefs
        room.getChildren(GEO_REFERENCE_ROOM_RELATION);
        // const roomRefs = await room.getChildren(GEO_REFERENCE_ROOM_RELATION);
        // const aggrData = [];
        // for (const roomRef of roomRefs) {
        //   pushToAggregateSetDbidByBimFileId(
        //     aggrData,
        //     roomRef.info.dbid.get(),
        //     roomRef.info.bimFileId.get()
        //   );
        // }
        return {
          type: 'room',
          id: room.info.id.get(),
          name: room.info.name.get(),
          server_id: room._server_id,
          children: [],
          // data: aggrData,
        };
      });
      return {
        type: 'floor',
        id: floor.info.id.get(),
        name: floor.info.name.get(),
        server_id: floor._server_id,
        children: await Promise.all(roomDatas),
      };
    });

    return {
      type: 'building',
      id: building.info.id.get(),
      name: building.info.name.get(),
      server_id: building._server_id,
      children: await Promise.all(buildingChildren),
    };
  });

  return Promise.all(proms);
}

export function pushToAggregateSetDbidByBimFileId(
  targetArray: IAggregateSetDbidByBimFileId[],
  id: number,
  bimFileId: string
): void {
  if (id === -1) return;
  for (const obj of targetArray) {
    if (obj.bimFileId === bimFileId) {
      obj.dbId.add(id);
      return;
    }
  }

  const idSet = new Set<number>();
  idSet.add(id);
  targetArray.push({
    bimFileId,
    dbId: idSet,
  });
}
