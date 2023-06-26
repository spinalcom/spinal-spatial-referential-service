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
import type { TProjectionLst } from '../../interfaces/TProjectionLst';
import type { ProjectionItem } from './ProjectionItem';
import type { ProjectionGroup } from './ProjectionGroup';
import { isProjectionGroup } from '../../utils/projection/isProjectionGroup';
import { getConfigFromContext } from '../projectionConfig/getConfigFromContext';
import { createConfigNode } from '../projectionConfig/createConfigNode';
import { removeConfigFromContext } from '../projectionConfig/removeConfigFromContext';
import { ProjectionGroupModel } from '../projectionModels/ProjectionGroupModel';
import { ProjectionItemModel } from '../projectionModels/ProjectionItemModel';
import { FileSystem } from 'spinal-core-connectorjs';

export class ProjectionGroupConfig {
  name: string;
  uid: string;
  data: TProjectionLst = [];
  progress = 100;
  isLoaded = false;

  constructor(
    name: string,
    readonly _server_id: number,
    uid = `${Date.now()}-${Math.round(Math.random() * 10000)}-${Math.round(
      Math.random() * 10000
    )}`
  ) {
    this.name = name;
    this.uid = uid;
  }

  countChild(): number {
    let counter = 0;

    for (const itm of this.data) {
      if (isProjectionGroup(itm)) {
        counter += itm.computedData.length;
      } else {
        counter += 1;
      }
    }
    return counter;
  }

  removeFromContext(context: SpinalContext) {
    return removeConfigFromContext(context, this.uid);
  }

  async loadConfigNode() {
    try {
      if (this.isLoaded) {
        return;
      }
      this.isLoaded = true;
      const configNode = FileSystem._objects[this._server_id];
      const lstData = await configNode.getElement();
      const promises: Promise<ProjectionItem | ProjectionGroup>[] = [];
      for (const data of lstData) {
        promises.push(data.toUxModel());
      }
      const data = await Promise.all(promises);
      for (const itm of data) {
        if (itm) this.data.push(itm);
      }
      if (typeof configNode.info.uid === 'undefined') {
        configNode.info.add_attr('uid', this.uid);
      }
    } catch (error) {
      this.isLoaded = false;
      throw error;
    }
  }

  async saveToContext(context: SpinalContext): Promise<void> {
    let projectLst = await getConfigFromContext(context, this, true);
    if (!projectLst) {
      projectLst = await createConfigNode(context, this);
    }
    if (this.isLoaded === false) await this.loadConfigNode();
    const promises: Promise<ProjectionGroupModel | ProjectionItemModel>[] = [];
    for (const data of this.data) {
      const itmInModel = projectLst.detect((itm) => itm.uid.get() === data.uid);
      if (itmInModel) promises.push(itmInModel.update(<any>data));
      else {
        if (isProjectionGroup(data)) {
          const mod = new ProjectionGroupModel(data);
          promises.push(mod.update(data));
        } else {
          const mod = new ProjectionItemModel(data);
          promises.push(mod.update(data));
        }
      }
    }
    const res = await Promise.all(promises);
    let change = false;
    for (let idx = 0; idx < res.length; idx++) {
      if (res[idx] !== projectLst[idx]) change = true;
    }
    if (change) {
      while (projectLst.length > 0) projectLst.pop();
      for (let idx = 0; idx < res.length; idx++) {
        projectLst.push(res[idx]);
      }
    } else {
      projectLst.trim(res.length);
    }
  }
}
