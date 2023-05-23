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

import type { IProjectionGroupItem } from '../../interfaces/IProjectionGroupItem';
import {
  type Lst,
  type Str,
  FileSystem,
  Model,
  spinalCore,
} from 'spinal-core-connectorjs';
import {
  getBimFileIdByModelId,
  getDbIdChildren,
  getModelByBimFileIdLoaded,
  getModelByModelId,
  getPropItemFromPropPath,
  getPropPath,
} from '../../utils';
import { getExternalIdMapping } from '../../utils/getExternalIdMapping';

export class ProjectionGroupItemModel extends Model {
  // name: Str;
  bimFileId: Str;
  uid: Str;
  externalId?: Str;
  path?: Lst<Str>;

  constructor(item: IProjectionGroupItem);
  constructor();
  constructor(item?: IProjectionGroupItem) {
    super();
    if (FileSystem._sig_server === false) return;
    // this.add_attr('name', item.name);
    this.add_attr('bimFileId', getBimFileIdByModelId(item.modelId));
    this.add_attr('uid', item.uid);
    // this.add_attr('externalId', item.externalId);
  }

  async update(item: IProjectionGroupItem) {
    // this.name.set(item.name);
    this.bimFileId.set(getBimFileIdByModelId(item.modelId));
    this.uid.set(item.uid);
    const model = getModelByModelId(item.modelId);
    const tree = model.getInstanceTree();
    const children = getDbIdChildren(tree, item.dbId);
    if (children.length > 0) {
      const path = await getPropPath(item.dbId, model);
      if (typeof this.path === 'undefined') {
        this.add_attr('path', path);
      } else {
        this.path.set(path);
      }
    } else {
      if (typeof this.externalId === 'undefined') {
        this.add_attr('externalId', item.externalId);
      } else {
        this.externalId.set(item.externalId);
      }
    }
  }
  async toUxModel(): Promise<{ modelId: number; dbid: number }> {
    const model = getModelByBimFileIdLoaded(this.bimFileId.get());
    if (typeof this.path !== 'undefined') {
      const path = this.path.get();
      const props = await getPropItemFromPropPath(path, model);
      if (!props) {
        console.error(
          `ProjectionGroupItemModel [${this.uid.get()}] no item found for path : ${path}`
        );
        return;
      }
      return {
        modelId: model.id,
        dbid: props.dbId,
      };
    } else {
      const extMap = await getExternalIdMapping(model);
      const dbid = extMap[this.externalId.get()];
      if (!dbid) {
        console.warn(
          `ProjectionGroupItemModel [${this.uid.get()}] skiped - no item found for externalId : ${this.externalId.get()}`
        );
        return;
      }
      return {
        modelId: model.id,
        dbid: dbid,
      };
    }
  }
}
spinalCore.register_models(ProjectionGroupItemModel);
