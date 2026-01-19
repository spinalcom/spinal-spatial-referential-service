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

import type { AuProps } from '../../interfaces/AuProps';
import type { IProjectionOffset } from '../../interfaces/IProjectionOffset';
import type { IAggregateSelectItem } from '../../interfaces/IAggregateSelectItem';
import { getBulkProperties } from '../../utils/projection/getBulkProperties';
import { getModelByModelId } from '../../utils/projection/getModelByModelId';
import { IProjectionGroupItem } from '../../interfaces/IProjectionGroupItem';

export class ProjectionGroup {
  name: string;
  offset: IProjectionOffset = { r: 0, t: 0, z: 0 };
  uid = `${Date.now()}-${Math.round(Math.random() * 10000)}-${Math.round(
    Math.random() * 10000
  )}`;
  data: IAggregateSelectItem[] = [];
  computedData: IProjectionGroupItem[] = [];
  stopAtLeaf: boolean = false;
  aproximateByLevel: boolean = false;

  constructor(
    name: string,
    stopAtLeaf: boolean = false,
    aproximateByLevel: boolean = false
  ) {
    this.name = name;
    this.stopAtLeaf = stopAtLeaf;
    this.aproximateByLevel = aproximateByLevel;
  }

  async getAndMergeSelection(viewer: Autodesk.Viewing.Viewer3D): Promise<void> {
    viewer.getAggregateSelection(
      (model: Autodesk.Viewing.Model, dbId: number) => {
        const found = this.data.find((el) => {
          return el.modelId === model.id;
        });
        if (typeof found !== 'undefined') {
          if (!found.selection.includes(dbId)) {
            found.selection.push(dbId);
          }
        } else {
          this.data.push({
            modelId: model.id,
            selection: [dbId],
          });
        }
      }
    );
    await this.updateComputed();
  }

  async updateComputed(): Promise<void> {
    const proms: Promise<AuProps[]>[] = [];
    for (const { modelId, selection } of this.data) {
      if (selection.length === 0) continue;
      proms.push(getBulkProperties(modelId, selection));
    }
    const tmpRes = await Promise.all(proms);
    this.data = this.data.filter((obj) => {
      return obj.selection.length !== 0;
    });
    this.computedData = [];
    for (const arr of tmpRes) {
      for (const item of arr) {
        Object.assign(item, {
          uid: `${Date.now()}-${Math.round(Math.random() * 10000)}-${Math.round(
            Math.random() * 10000
          )}`,
        });
        this.computedData.push(<IProjectionGroupItem>item);
      }
    }
  }

  deleteItem(item: { modelId: number; dbId: number }) {
    for (const { modelId, selection } of this.data) {
      if (modelId === item.modelId) {
        const idx = selection.indexOf(item.dbId);
        if (idx !== -1) {
          selection.splice(idx, 1);
          return this.updateComputed();
        }
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  }

  selectItem(
    item: { modelId: number; dbId: number },
    viewer: Autodesk.Viewing.Viewer3D
  ): void {
    for (const { modelId } of this.data) {
      if (modelId === item.modelId) {
        const model = getModelByModelId(modelId);
        return viewer.select([item.dbId], model);
      }
    }
  }
  selectAll(viewer: Autodesk.Viewing.Viewer3D): void {
    viewer.clearSelection();
    for (const { modelId, selection } of this.data) {
      const model = getModelByModelId(modelId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (<any>model).selector.setSelection(selection, model);
    }
  }
}
