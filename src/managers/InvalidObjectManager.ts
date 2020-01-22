/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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
  SPINAL_RELATION_TYPE,
  SpinalNodeRef,
  SpinalContext
} from "spinal-env-viewer-graph-service";
import Obj = spinal.Obj;

export const CONTEXT_NAME: string = 'Invalid';
export const SPATIAL_START_NODE_RELATION_NAME: string = 'hasSpatialInvalidStartNode';
export const SPATIAL_RELATION_NAME: string = 'hasSpatialInvalidNode';
export const SPATIAL_START_NODE_NAME: string = 'Object invalid du' +
  ' context Spatial';

export class InvalidObjectManager {

  private context: SpinalContext<any>;
  public contextId: string;
  private spatialStartNode: SpinalNodeRef;
  private readonly initialized: Promise<boolean>;

  constructor() {
    this.initialized = this.init();
  }

  public async addObject(nodeId) {
    await this.initialized;
    return SpinalGraphService.addChildInContext(this.spatialStartNode.id.get(),
      nodeId, this.context.info.id.get(), SPATIAL_RELATION_NAME, SPINAL_RELATION_TYPE);
  }

  private init(): Promise<boolean> {
    return new Promise(async resolve => {
      try {
        await SpinalGraphService.waitForInitialization();

        this.context = await InvalidObjectManager.getContext();
        this.contextId = this.context.info.id.get();
        this.spatialStartNode = await this.getSpatialStartNode();
        resolve(true);
      } catch (e) {
        console.error(e);
        resolve(false);
      }
    });
  }

  private async getSpatialStartNode(): Promise<SpinalNodeRef> {
    const children = await SpinalGraphService
      .getChildren(this.contextId, [SPATIAL_START_NODE_RELATION_NAME]);
    for (let i = 0; i < children.length; i++) {
      if (children[i].name.get() === SPATIAL_START_NODE_NAME) {
        return children[i];
      }
    }
    const startNodeId = SpinalGraphService.createNode({ name: SPATIAL_START_NODE_NAME }, undefined);
    const contextId = this.context.info.id.get();
    await SpinalGraphService.addChildInContext(contextId, startNodeId, contextId, SPATIAL_START_NODE_RELATION_NAME, SPINAL_RELATION_TYPE);
    return SpinalGraphService.getNode(startNodeId);
  }

  private static async getContext() {
    let context = SpinalGraphService.getContext(CONTEXT_NAME);
    if (typeof context === "undefined")
      context = await InvalidObjectManager.createContext();

    return context
  }

  private static async createContext() {
    return await SpinalGraphService.addContext(CONTEXT_NAME, 'SpinalSystem', undefined);
  }
}
