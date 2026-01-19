/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import type { IAggregateDbidSetByModelItem } from '../..';
import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
import {
  getAllModelLoaded,
  getModelByModelId,
  getRealNode,
  getViewer,
} from '../../utils';
import colors from './colors.json';

interface IAggregateDbidByModelItem {
  model: Autodesk.Viewing.Model;
  dbId: number[];
}
interface IRoomData {
  color: THREE.Vector4;
  dbid: number;
  modelId: number;
  data: IAggregateDbidByModelItem[];
}
interface IFloorData {
  nodeId: string;
  name: string;
  rooms: IRoomData[];
}

export class ProjectionTester {
  public pageSize = colors.length;
  private viewer = getViewer();
  private floorsData: IFloorData[] = [];
  private colors: THREE.Vector4[] = colors.map(
    (c) => new THREE.Vector4(c[0] / 255, c[1] / 255, c[2] / 255, 1)
  );
  constructor(
    intersectRes: IRaycastIntersectRes[],
    roomRefsByFloor: Record<string, IAggregateDbidSetByModelItem[]>
  ) {
    this.assignItemByRooms(intersectRes, roomRefsByFloor);
  }

  getFloorsDataUx(): { id: string; name: string; size: number }[] {
    return this.floorsData.map((item) => {
      return {
        id: item.nodeId,
        name: item.name,
        size: item.rooms.length,
        index: 0,
      };
    });
  }

  /**
   * @param {number} pageIndex start at 0
   * @memberof ProjectionTester
   */
  public colorRooms(floorNodeId: string, pageIndex: number) {
    const floorData = this.floorsData.find((f) => f.nodeId === floorNodeId);
    if (!floorData) return;
    const nbPages = Math.ceil(floorData.rooms.length / this.pageSize);
    if (pageIndex >= nbPages) pageIndex = nbPages - 1;
    const models = getAllModelLoaded();
    for (const model of models) {
      model.clearThemingColors();
    }
    const start = pageIndex * this.pageSize;
    const end = start + this.pageSize;
    const roomSlice = floorData.rooms.slice(start, end);
    const aggrData: IAggregateDbidByModelItem[] = [];
    for (let i = 0; i < roomSlice.length; i++) {
      const roomData = roomSlice[i];
      for (const data of roomData.data) {
        for (const dbid of data.dbId) {
          data.model.setThemingColor(dbid, roomData.color);
        }
        pushToAggregateDbidByModel(aggrData, data.dbId, data.model);
      }
    }
    const dataview = aggrData.map((view) => {
      return { model: view.model, selection: view.dbId, ids: view.dbId };
    });
    // @ts-ignore
    this.viewer.fitToView(dataview);
    // @ts-ignore
    this.viewer.impl.visibilityManager.aggregateIsolate(dataview);
    this.viewer.impl.invalidate(true);

    // if (pageIndex > this.nbPages) pageIndex = this.nbPages;
    // const models = getAllModelLoaded();
    // for (const model of models) {
    //   this.viewer.clearThemingColors(model);
    // }
    // const start = pageIndex * this.pageSize;
    // const end = start + this.pageSize;
    // const roomSlice = this.roomData.slice(start, end);
    // const aggrData: IAggregateDbidByModelItem[] = [];
    // for (let i = 0; i < roomSlice.length; i++) {
    //   const roomData = roomSlice[i];
    //   for (const data of roomData.data) {
    //     for (const dbid of data.dbId) {
    //       data.model.setThemingColor(dbid, roomData.color);
    //     }
    //     pushToAggregateDbidByModel(aggrData, data.dbId, data.model);
    //   }
    // }
    // const dataview = aggrData.map((view) => {
    //   return { model: view.model, selection: view.dbId, ids: view.dbId };
    // });
    // // @ts-ignore
    // this.viewer.fitToView(dataview);
    // // @ts-ignore
    // this.viewer.impl.visibilityManager.aggregateIsolate(dataview);
    // this.viewer.impl.invalidate(true);
  }
  public clearColors() {
    const models = getAllModelLoaded();
    for (const model of models) {
      this.viewer.clearThemingColors(model);
    }
    this.viewer.impl.invalidate(true);
  }

  private assignItemByRooms(
    intersectRes: IRaycastIntersectRes[],
    roomRefsByFloor: Record<string, IAggregateDbidSetByModelItem[]>
  ) {
    this.floorsData = [];
    for (const inter of intersectRes) {
      const floorData = this.getFloorData(
        inter.intersections.modelId,
        inter.intersections.dbId,
        roomRefsByFloor
      );
      // get room data
      let roomData = floorData.rooms.find(
        (r) =>
          r.dbid === inter.intersections.dbId &&
          r.modelId === inter.intersections.modelId
      );
      if (!roomData) {
        roomData = {
          dbid: inter.intersections.dbId,
          modelId: inter.intersections.modelId,
          color: this.colors[(floorData.rooms.length + 1) % this.colors.length],
          data: [],
        };
        floorData.rooms.push(roomData);
      }
      const model = getModelByModelId(inter.intersections.modelId);
      pushToAggregateDbidByModel(
        roomData.data,
        [inter.intersections.dbId],
        model
      );
      const modelObj = getModelByModelId(inter.origin.modelId);
      pushToAggregateDbidByModel(roomData.data, [inter.origin.dbId], modelObj);
    }

    //   const rooms: Map<number, IAggregateDbidByModelItem[]> = new Map();
    //   for (const inter of intersectRes) {
    //     let room = rooms.get(inter.intersections.dbId);
    //     if (!room) {
    //       room = [];
    //       rooms.set(inter.intersections.dbId, room);
    //     }
    //     const model = getModelByModelId(inter.intersections.modelId);
    //     pushToAggregateDbidByModel(room, [inter.intersections.dbId], model);
    //     const modelObj = getModelByModelId(inter.origin.modelId);
    //     pushToAggregateDbidByModel(room, [inter.origin.dbId], modelObj);
    //   }
    //   this.roomData = [];
    //   let index = 0;
    //   for (const [roomId, data] of rooms) {
    //     this.roomData.push({
    //       color: this.colors[index % this.colors.length],
    //       data,
    //     });
    //     index++;
    //   }
  }

  private getFloorData(
    modelId: number,
    roomDbId: number,
    roomRefsByFloor: Record<string, IAggregateDbidSetByModelItem[]>
  ) {
    const roomModel = getModelByModelId(modelId);
    const FloorNodeId = this.getFloorIdByModelAndDbid(
      roomRefsByFloor,
      roomModel,
      roomDbId
    );
    const floorName = this.getFloorNameById(FloorNodeId);
    let floorData = this.floorsData.find((f) => f.nodeId === FloorNodeId);
    if (!floorData) {
      floorData = {
        nodeId: FloorNodeId,
        name: floorName,
        rooms: [],
      };
      this.floorsData.push(floorData);
    }
    return floorData;
  }

  private getFloorIdByModelAndDbid(
    roomRefsByFloor: Record<string, IAggregateDbidSetByModelItem[]>,
    model: Autodesk.Viewing.Model,
    dbId: number
  ) {
    for (const floorNodeId in roomRefsByFloor) {
      const refs = roomRefsByFloor[floorNodeId];
      for (const ref of refs) {
        if (ref.model === model && ref.dbId.has(dbId)) {
          return floorNodeId;
        }
      }
    }
    return undefined;
  }

  private getFloorNameById(floorId: string): string {
    const floorNode = getRealNode(floorId);
    return floorNode ? floorNode.info.name.get() : 'undefined';
  }
}

function pushToAggregateDbidByModel(
  targetArray: IAggregateDbidByModelItem[],
  ids: number[],
  model: Autodesk.Viewing.Model
): void {
  for (const obj of targetArray) {
    if (obj.model === model) {
      for (const id of ids) {
        const findItem = obj.dbId.find((a) => a === id);
        if (findItem === undefined) {
          obj.dbId.push(id);
        }
      }
      return;
    }
  }

  const dbId = [];
  for (const id of ids) {
    dbId.push(id);
  }
  targetArray.push({
    model,
    dbId,
  });
}
