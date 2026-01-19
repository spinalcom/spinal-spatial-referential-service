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

import type { IProjectionItem } from '../../interfaces/IProjectionItem';
import type { IProjectionOffset } from '../../interfaces/IProjectionOffset';
import { getModelByModelId } from '../../utils/projection/getModelByModelId';

export class ProjectionItem implements IProjectionItem {
  name: string;
  offset: IProjectionOffset = { r: 0, t: 0, z: 0 };
  uid = `${Date.now()}-${Math.round(Math.random() * 10000)}-${Math.round(
    Math.random() * 10000
  )}`;
  modelId: number;
  externalId: string;
  dbId: number;
  id: string;
  properties: Autodesk.Viewing.Property[];
  stopAtLeaf = false;
  aproximateByLevel = false;

  constructor(
    name: string,
    modelId: number,
    dbId: number,
    properties: Autodesk.Viewing.Property[],
    externalId: string,
    stopAtLeaf: boolean = false,
    aproximateByLevel: boolean = false
  ) {
    this.name = name;
    this.modelId = modelId;
    this.dbId = dbId;
    this.id = `${modelId}-${dbId}`;
    this.properties = properties;
    this.externalId = externalId;
    this.stopAtLeaf = stopAtLeaf;
    this.aproximateByLevel = aproximateByLevel;
  }
  selectItem(viewer: Autodesk.Viewing.Viewer3D) {
    const model = getModelByModelId(this.modelId);
    return viewer.select([this.dbId], model);
  }
}
