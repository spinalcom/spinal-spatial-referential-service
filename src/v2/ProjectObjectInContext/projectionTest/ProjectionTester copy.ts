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
import { getAllModelLoaded, getModelByModelId, getViewer } from '../../utils';
import colors from './colors.json';

interface IAggregateDbidByModelItem {
  model: Autodesk.Viewing.Model;
  dbId: number[];
}
interface IRoomData {
  color: THREE.Vector4;
  data: IAggregateDbidByModelItem[];
}

export class ProjectionTester {
  public nbPages: number;
  private pageSize = 25;
  private viewer = getViewer();
  // private floors: Map<number, IAggregateDbidByModelItem[]> = new Map();
  private roomData: IRoomData[] = [];
  private colors: THREE.Vector4[] = colors.map(
    (c) => new THREE.Vector4(c[0] / 255, c[1] / 255, c[2] / 255, 1)
  );
  constructor(intersectRes: IRaycastIntersectRes[]) {
    this.assignItemByRooms(intersectRes);
    this.nbPages = Math.ceil(this.roomData.length / colors.length);
  }

  /**
   * @param {number} pageIndex start at 0
   * @memberof ProjectionTester
   */
  public colorRooms(pageIndex: number) {
    if (pageIndex > this.nbPages) pageIndex = this.nbPages;
    const models = getAllModelLoaded();
    for (const model of models) {
      this.viewer.clearThemingColors(model);
    }
    const start = pageIndex * this.pageSize;
    const end = start + this.pageSize;
    const roomSlice = this.roomData.slice(start, end);
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
  }
  public clearColors() {
    const models = getAllModelLoaded();
    for (const model of models) {
      this.viewer.clearThemingColors(model);
    }
    this.viewer.impl.invalidate(true);
  }

  private assignItemByRooms(intersectRes: IRaycastIntersectRes[]) {
    const rooms: Map<number, IAggregateDbidByModelItem[]> = new Map();
    for (const inter of intersectRes) {
      let room = rooms.get(inter.intersections.dbId);
      if (!room) {
        room = [];
        rooms.set(inter.intersections.dbId, room);
      }
      const model = getModelByModelId(inter.intersections.modelId);
      pushToAggregateDbidByModel(room, [inter.intersections.dbId], model);
      const modelObj = getModelByModelId(inter.origin.modelId);
      pushToAggregateDbidByModel(room, [inter.origin.dbId], modelObj);
    }
    this.roomData = [];
    let index = 0;
    for (const [roomId, data] of rooms) {
      this.roomData.push({
        color: this.colors[index % this.colors.length],
        data,
      });
      index++;
    }
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
