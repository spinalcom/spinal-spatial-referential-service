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

import {
  GEO_BUILDING_TYPE,
  GEO_CONTEXT_TYPE,
  GEO_SITE_TYPE,
} from '../../Constant';
import { guid } from '../utils';
import { ETreeItemStatus, type ITreeItem } from './ITreeItem';

export function spatialTreeCreateBuilding(
  parent: ITreeItem,
  name: string,
  contextId: string
) {
  if (parent.type === GEO_SITE_TYPE || parent.type === GEO_CONTEXT_TYPE)
    parent.children.push({
      name,
      id: guid(),
      contextId,
      status: ETreeItemStatus.newItem,
      type: GEO_BUILDING_TYPE,
      children: [],
    });
  else throw new Error('Parent Item must be the Geographic Context or a Site');
}
