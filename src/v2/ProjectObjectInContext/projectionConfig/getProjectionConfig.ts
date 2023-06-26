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

import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import type { ProjectionItemModel } from '../projectionModels/ProjectionItemModel';
import type { ProjectionGroupModel } from '../projectionModels/ProjectionGroupModel';
import type { Lst } from 'spinal-core-connectorjs';
import { PROJECTION_CONFIG_RELATION } from '../../constant';
import { ProjectionGroupConfig } from '../ProjectionItem/ProjectionGroupConfig';
import { waitGetServerId } from '../../utils';

export async function getProjectionConfig(
  context: SpinalContext
): Promise<ProjectionGroupConfig[]> {
  const configNodes: SpinalNode<
    Lst<ProjectionGroupModel | ProjectionItemModel>
  >[] = await context.getChildren(PROJECTION_CONFIG_RELATION);

  const res: ProjectionGroupConfig[] = [];
  for (const configNode of configNodes) {
    await waitGetServerId(configNode);
    let projectionGroupConfig: ProjectionGroupConfig;
    // old config => add uid
    if (typeof configNode.info.uid === 'undefined') {
      projectionGroupConfig = new ProjectionGroupConfig(
        configNode.info.name.get(),
        configNode._server_id
      );
    } else {
      projectionGroupConfig = new ProjectionGroupConfig(
        configNode.info.name.get(),
        configNode._server_id,
        configNode.info.uid.get()
      );
    }
    res.push(projectionGroupConfig);
  }
  return res;
}
