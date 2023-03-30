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
  SpinalGraphService,
  SpinalNodeRef,
} from 'spinal-env-viewer-graph-service';
import { SpinalGraph, SpinalNode } from 'spinal-model-graph';

export function addNodeGraphService(node: SpinalNode): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  SpinalGraphService._addNode(node);
}

export function getGraph(): SpinalGraph {
  return SpinalGraphService.getGraph();
}

export function getRealNode(nodeId: string): SpinalNode {
  return SpinalGraphService.getRealNode(nodeId);
}

export function getInfoGraphService(nodeId: string): SpinalNodeRef {
  return SpinalGraphService.getInfo(nodeId);
}
