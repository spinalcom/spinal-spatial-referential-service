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

import { SpinalNode, SpinalContext } from 'spinal-model-graph';
import { compress, decompress, trimUndefinedRecursively } from 'compress-json';
import { deflate, inflate } from 'pako';
import { Path } from 'spinal-core-connectorjs';
import { addNodeGraphService, getGraph } from '../utils/graphservice';

export const GENERATION_CONTEXT_NAME = 'Generation Context';
export const GENERATION_CONTEXT_TYPE = 'GenerationContext';
export const GENERATION_TYPE = 'GenerationType';
export const GENERATION_RELATION = 'hasGeneration';
export const GENERATION_GEO_TYPE = 'ContextSpatial';

export async function getContextGeneration() {
  const graph = getGraph();
  const contextRes: SpinalContext = await graph.getContext(
    GENERATION_CONTEXT_NAME
  );
  if (contextRes) return contextRes;
  const context = new SpinalContext(
    GENERATION_CONTEXT_NAME,
    GENERATION_CONTEXT_TYPE
  );
  await graph.addContext(context);
  addNodeGraphService(context);
  return context;
}

export async function saveCmds(
  json: object,
  local = true
): Promise<{ node: SpinalNode<Path>; data: Path }> {
  const context = await getContextGeneration();
  trimUndefinedRecursively(json);
  const compressed = deflate(JSON.stringify(compress(json)));
  const p = new Path();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p.file = <any>compressed;
  p.remaining.set(compressed.length);
  p.to_upload.set(compressed.length);
  const node = new SpinalNode(
    `ContextSpatial-${new Date().toISOString()}`,
    GENERATION_TYPE,
    p
  );
  node.info.add_attr('generationType', GENERATION_GEO_TYPE);
  node.info.add_attr('local', local);
  await context.addChildInContext(node, GENERATION_RELATION);
  return { node, data: p };
}

export function waitPathSendToHub(path: Path): Promise<void> {
  return new Promise((resolve) => {
    const inter = setInterval(() => {
      if (path.remaining.get() === 0) {
        clearInterval(inter);
        resolve();
      }
    }, 100);
  });
}

export function getCmdServId(node: SpinalNode<Path>): number {
  if (node.info.type.get() !== GENERATION_TYPE)
    throw new Error(
      `getCmd, spinalnode in agument is not of type ${GENERATION_TYPE}`
    );
  if (!node.element)
    throw new Error(`getCmd, spinalnode in agument have no Element`);
  return node.element.ptr.data.model?._server_id || node.element.ptr.data.value;
}

export function decode(compressed: Uint8Array) {
  const ungzip = inflate(compressed, { to: 'string' });
  const reversed = decompress(JSON.parse(ungzip));
  return reversed;
}
