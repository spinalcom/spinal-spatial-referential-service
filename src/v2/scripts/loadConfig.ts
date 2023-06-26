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
  type SpinalGraph,
  SpinalNode,
  SpinalContext,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-model-graph';
import { SpatialConfig } from '../../models/SpatialConfig';

export async function loadConfig(graph: SpinalGraph): Promise<SpatialConfig> {
  let configContext = await graph.getContext('.config');
  if (typeof configContext === 'undefined') {
    configContext = new SpinalContext(
      '.config',
      'system configuration',
      undefined
    );
    graph.addContext(configContext);
  }
  const children = await configContext.getChildren(['hasConfig']);

  let config: SpinalNode<SpatialConfig>;
  for (let i = 0; i < children.length; i++) {
    if (children[i].info.type.get() === 'SpatialConfig') {
      config = children[i];
      break;
    }
  }

  if (typeof config === 'undefined') {
    // create default config
    config = new SpinalNode(
      'spatial config',
      'SpatialConfig',
      new SpatialConfig()
    );

    await configContext.addChild(
      config,
      'hasConfig',
      SPINAL_RELATION_PTR_LST_TYPE
    );
  }
  return config.element.load();
}
