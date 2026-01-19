/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
import type { ProjectionFloorConfig } from '../../interfaces/ProjectionFloorConfig';
import type { ProjectionFloorConfigModel } from '../../interfaces/ProjectionFloorConfigModel';
import { Ptr, Lst } from 'spinal-core-connectorjs_type';

export async function getOrCreateProjectionFloorConfig(
  context: SpinalContext
): Promise<ProjectionFloorConfig[]> {
  let config: Lst<ProjectionFloorConfigModel>;
  if (typeof context.info.projectionFloorConfig === 'undefined') {
    config = new Lst<ProjectionFloorConfigModel>();
    context.info.add_attr('projectionFloorConfig', new Ptr(config));
  } else config = await context.info.projectionFloorConfig.load();
  return config.get();
}
