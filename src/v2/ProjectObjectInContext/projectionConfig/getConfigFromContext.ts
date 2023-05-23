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

import type { SpinalNode, SpinalContext } from 'spinal-model-graph';
import type { Lst } from 'spinal-core-connectorjs';
import type { ProjectionGroupConfig } from '../ProjectionItem/ProjectionGroupConfig';
import type { ProjectionGroupModel } from '../projectionModels/ProjectionGroupModel';
import type { ProjectionItemModel } from '../projectionModels/ProjectionItemModel';
import { PROJECTION_CONFIG_RELATION } from '../../constant';

export async function getConfigFromContext(
  context: SpinalContext,
  item: ProjectionGroupConfig,
  updateName = false
): Promise<Lst<ProjectionGroupModel | ProjectionItemModel>> {
  const configNodes: SpinalNode<
    Lst<ProjectionGroupModel | ProjectionItemModel>
  >[] = await context.getChildren(PROJECTION_CONFIG_RELATION);
  for (const node of configNodes) {
    if (node.info.uid.get() === item.uid) {
      if (updateName) {
        node.info.name.set(item.name);
      }
      return node.getElement();
    }
  }
}
