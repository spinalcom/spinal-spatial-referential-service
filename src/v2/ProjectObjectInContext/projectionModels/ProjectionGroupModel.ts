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
import { ProjectionGroup } from '../ProjectionItem/ProjectionGroup';
import {
  type Bool,
  type Lst,
  type Str,
  FileSystem,
  Model,
  spinalCore,
} from 'spinal-core-connectorjs';
import { ProjectionOffsetModel } from './ProjectionOffsetModel';
import { ProjectionGroupItemModel } from './ProjectionGroupItemModel';

export class ProjectionGroupModel extends Model {
  name: Str;
  offset: ProjectionOffsetModel;
  uid: Str;
  data: Lst<ProjectionGroupItemModel>;
  stopAtLeaf: Bool;

  constructor(projectionGroup?: ProjectionGroup) {
    super();
    if (FileSystem._sig_server === false) return;
    this.add_attr('name', projectionGroup.name);
    this.add_attr('uid', projectionGroup.uid);
    this.add_attr('offset', new ProjectionOffsetModel(projectionGroup.offset));
    this.add_attr('data', []);
    this.add_attr('stopAtLeaf', projectionGroup.stopAtLeaf || false);
  }
  private async updateData(projectionGroup: ProjectionGroup): Promise<this> {
    const promises: Promise<ProjectionGroupItemModel>[] = [];
    const toDel: ProjectionGroupItemModel[] = [];
    for (let idx = 0; idx < this.data.length; idx++) {
      const projItemModel: ProjectionGroupItemModel = this.data[idx];
      const item = projectionGroup.computedData.find((itm) => {
        return itm.uid === projItemModel.uid.get();
      });
      if (item) {
        promises.push(projItemModel.update(item));
      } else {
        toDel.push(projItemModel);
      }
    }
    for (const itm of toDel) {
      this.data.remove_ref(itm);
    }

    // add
    for (const data of projectionGroup.computedData) {
      const item = this.data.detect((itm) => {
        return itm.uid.get() === data.uid;
      });
      if (!item) {
        const mod = new ProjectionGroupItemModel(data);
        promises.push(mod.update(data));
        this.data.push(mod);
      }
    }
    await Promise.all(promises);
    return this;
  }
  update(projectionGroup: ProjectionGroup): Promise<this> {
    this.name.set(projectionGroup.name);
    this.uid.set(projectionGroup.uid);
    this.offset.update(projectionGroup.offset);
    this.offset.update(projectionGroup.offset);
    if (typeof projectionGroup.stopAtLeaf === 'undefined') {
      this.add_attr('stopAtLeaf', projectionGroup.stopAtLeaf);
    } else {
      this.stopAtLeaf.set(projectionGroup.stopAtLeaf);
    }
    return this.updateData(projectionGroup);
  }

  async toUxModel(): Promise<ProjectionGroup> {
    const projectionGroup = new ProjectionGroup(
      this.name.get(),
      this.stopAtLeaf?.get() || false
    );
    projectionGroup.offset = this.offset.get();
    projectionGroup.uid = this.uid.get();
    const promises: ReturnType<ProjectionGroupItemModel['toUxModel']>[] = [];
    for (const data of this.data) {
      promises.push(data.toUxModel());
    }
    const data = await Promise.all(promises);
    for (const { modelId, dbid } of data) {
      const obj = projectionGroup.data.find((itm) => itm.modelId === modelId);
      if (obj) obj.selection.push(dbid);
      else projectionGroup.data.push({ modelId, selection: [dbid] });
    }
    await projectionGroup.updateComputed();
    return projectionGroup;
  }
}
spinalCore.register_models(ProjectionGroupModel);
