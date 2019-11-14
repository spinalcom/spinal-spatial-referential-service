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

  private context: SpinalContext;
  public contextId: string;
  private spatialStartNode: SpinalNodeRef;
  private readonly initialized: Promise<boolean>;

  constructor() {
    this.initialized = this.init();
  }

  public async addObject(nodeId){
    await this.initialized;
    return SpinalGraphService.addChildInContext(this.spatialStartNode.id.get(),
      nodeId, this.context.info.id.get(),SPATIAL_RELATION_NAME, SPINAL_RELATION_TYPE );
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
    const startNodeId = SpinalGraphService.createNode({name: SPATIAL_START_NODE_NAME}, undefined);
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
