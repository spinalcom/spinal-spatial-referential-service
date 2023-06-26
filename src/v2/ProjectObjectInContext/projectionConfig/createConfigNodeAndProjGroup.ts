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

import { ProjectionGroupConfig } from '../ProjectionItem/ProjectionGroupConfig';
import { SpinalNode, type SpinalContext } from 'spinal-model-graph';
import { Lst } from 'spinal-core-connectorjs';
import {
  PROJECTION_CONFIG_RELATION,
  PROJECTION_CONFIG_TYPE,
  PROJECTION_CONFIG_RELATION_TYPE,
} from '../../constant';
import { waitGetServerId } from '../../utils';

export async function createConfigNodeAndProjGroup(
  context: SpinalContext,
  name: string
): Promise<ProjectionGroupConfig> {
  const config = new Lst();
  const configNode = new SpinalNode(name, PROJECTION_CONFIG_TYPE, config);
  context.addChild(
    configNode,
    PROJECTION_CONFIG_RELATION,
    PROJECTION_CONFIG_RELATION_TYPE
  );
  await waitGetServerId(configNode);
  const cfgGroup = new ProjectionGroupConfig(name, configNode._server_id);
  configNode.info.add_attr('uid', cfgGroup.uid);
  return cfgGroup;
}
