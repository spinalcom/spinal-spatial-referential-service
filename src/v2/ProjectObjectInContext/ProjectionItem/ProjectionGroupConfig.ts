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
import { isProjectionGroup } from '../../utils/projection/isProjectionGroup';
import { getConfigFromContext } from '../projectionConfig/getConfigFromContext';
import { createConfigNode } from '../projectionConfig/createConfigNode';
import { removeConfigFromContext } from '../projectionConfig/removeConfigFromContext';
import { ProjectionGroupModel } from '../projectionModels/ProjectionGroupModel';
import { ProjectionItemModel } from '../projectionModels/ProjectionItemModel';

export class ProjectionGroupConfig {
  name: string;
  uid: string;
  data: TProjectionLst = [];
  progress = 100;

  constructor(
    name: string,
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

  async saveToContext(context: SpinalContext): Promise<void> {
    let projectLst = await getConfigFromContext(context, this, true);
    if (!projectLst) projectLst = await createConfigNode(context, this);
    const promises: Promise<void>[] = [];
    const toDel: (ProjectionGroupModel | ProjectionItemModel)[] = [];
    for (const projectItem of projectLst) {
      const item = this.data.find((itm) => projectItem.uid.get() === itm.uid);
      if (item) {
        promises.push(projectItem.update(<any>item));
      } else {
        toDel.push(projectItem);
      }
    }
    for (const itm of toDel) {
      projectLst.remove_ref(itm);
    }

    for (const data of this.data) {
      const item = projectLst.detect((itm) => {
        return itm.uid.get() === data.uid;
      });
      if (!item) {
        if (isProjectionGroup(data)) {
          const mod = new ProjectionGroupModel(data);
          promises.push(mod.update(data));
          projectLst.push(mod);
        } else {
          const mod = new ProjectionItemModel(data);
          promises.push(mod.update(data));
          projectLst.push(mod);
        }
      }
    }
    await Promise.all(promises);
  }
}