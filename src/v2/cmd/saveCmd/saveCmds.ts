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

import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { compress, trimUndefinedRecursively } from 'compress-json';
import { deflate } from 'pako';
import { Path } from 'spinal-core-connectorjs';
import { GENERATION_RELATION, GENERATION_TYPE } from '../../constant';
import { getContextGeneration } from './getContextGeneration';
import { addNodeGraphService } from '../../utils';

export async function saveCmds(
  json: object,
  generationType: string,
  local: boolean
): Promise<{ node: SpinalNode<Path>; context: SpinalContext; data: Path }> {
  const context = await getContextGeneration();
  trimUndefinedRecursively(json);
  const compressed = deflate(JSON.stringify(compress(json)));
  const p = new Path();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p.file = <any>compressed;
  p.remaining.set(compressed.length);
  p.to_upload.set(compressed.length);
  const node = new SpinalNode(
    `${generationType}-${new Date().toISOString()}`,
    GENERATION_TYPE,
    p
  );
  addNodeGraphService(node);
  node.info.add_attr('generationType', generationType);
  node.info.add_attr('local', local);
  await context.addChildInContext(node, GENERATION_RELATION);
  return { node, context, data: p };
}
