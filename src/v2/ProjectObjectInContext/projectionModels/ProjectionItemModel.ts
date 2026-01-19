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

import { ProjectionItem } from '../ProjectionItem/ProjectionItem';
import {
  type Lst,
  type Str,
  FileSystem,
  Model,
  spinalCore,
} from 'spinal-core-connectorjs';
import {
  getBimFileIdByModelId,
  getBulkProperties,
  getDbIdChildren,
  getModelByBimFileIdLoaded,
  getModelByModelId,
  getPropItemFromPropPath,
  getPropPath,
} from '../../utils';
import { ProjectionOffsetModel } from './ProjectionOffsetModel';
import { getExternalIdMapping } from '../../utils/getExternalIdMapping';
import { getBimFileByBimFileId } from '../../utils/getBimFileByBimFileId';

export class ProjectionItemModel extends Model {
  offset: ProjectionOffsetModel;
  uid: Str;
  bimFileId: Str;
  externalId?: Str;
  path?: Lst<Str>;

  constructor(projectionItem: ProjectionItem);
  constructor();
  constructor(projectionItem?: ProjectionItem) {
    super();
    if (FileSystem._sig_server === false) return;
    this.add_attr('uid', projectionItem.uid);
    this.add_attr('bimFileId', getBimFileIdByModelId(projectionItem.modelId));
    this.add_attr('offset', new ProjectionOffsetModel(projectionItem.offset));
    this.add_attr('stopAtLeaf', projectionItem.stopAtLeaf || false);
  }

  async update(projectionItem: ProjectionItem): Promise<this> {
    this.uid.set(projectionItem.uid);
    this.bimFileId.set(getBimFileIdByModelId(projectionItem.modelId));
    this.offset.update(projectionItem.offset);
    const model = getModelByModelId(projectionItem.modelId);
    const tree = model.getInstanceTree();
    const children = getDbIdChildren(tree, projectionItem.dbId);
    if (children.length > 0) {
      const path = await getPropPath(projectionItem.dbId, model);
      if (typeof this.path === 'undefined') {
        this.add_attr('path', path);
      } else {
        this.path.set(path);
      }
    } else {
      if (typeof this.externalId === 'undefined') {
        this.add_attr('externalId', projectionItem.externalId);
      } else {
        this.externalId.set(projectionItem.externalId);
      }
    }
    if (typeof this.stopAtLeaf === 'undefined') {
      this.add_attr('stopAtLeaf', projectionItem.stopAtLeaf);
    } else {
      this.stopAtLeaf.set(projectionItem.stopAtLeaf);
    }
    if (typeof this.aproximateByLevel === 'undefined') {
      this.add_attr('aproximateByLevel', projectionItem.aproximateByLevel);
    } else {
      this.aproximateByLevel.set(projectionItem.aproximateByLevel);
    }
    return this;
  }

  async toUxModel(): Promise<ProjectionItem> {
    const model = getModelByBimFileIdLoaded(this.bimFileId.get());
    if (!model) {
      try {
        const bimFile = await getBimFileByBimFileId(this.bimFileId.get());
        throw new Error(
          `Model [${bimFile.info.name.get()}] not loaded for bimFileId : ${this.bimFileId.get()}`
        );
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
    let projectionItem: ProjectionItem;
    if (typeof this.path !== 'undefined') {
      const path = this.path.get();
      const props = await getPropItemFromPropPath(path, model);
      if (!props) {
        throw new Error(
          `projectionItemModel [${this.uid.get()}] no item found for path : ${path}`
        );
      }
      projectionItem = new ProjectionItem(
        props.name,
        model.id,
        props.dbId,
        props.properties,
        props.externalId,
        this.stopAtLeaf?.get() || false,
        this.aproximateByLevel?.get() || false
      );
    } else {
      const extMap = await getExternalIdMapping(model);
      const dbid = extMap[this.externalId.get()];
      if (!dbid) {
        throw new Error(
          `projectionItemModel [${this.uid.get()}] skiped - no item found for externalId : ${this.externalId.get()}`
        );
      }
      const props = await getBulkProperties(model, [dbid]);
      projectionItem = new ProjectionItem(
        props[0].name,
        model.id,
        dbid,
        props[0].properties,
        props[0].externalId,
        this.stopAtLeaf?.get() || false,
        this.aproximateByLevel?.get() || false
      );
    }
    projectionItem.uid = this.uid.get();
    projectionItem.offset = this.offset.get();
    return projectionItem;
  }
}
spinalCore.register_models(ProjectionItemModel);
