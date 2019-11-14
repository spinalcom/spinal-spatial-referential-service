"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
exports.CONTEXT_NAME = 'Invalid';
exports.SPATIAL_START_NODE_RELATION_NAME = 'hasSpatialInvalidStartNode';
exports.SPATIAL_RELATION_NAME = 'hasSpatialInvalidNode';
exports.SPATIAL_START_NODE_NAME = 'Object invalid du' +
    ' context Spatial';
class InvalidObjectManager {
    constructor() {
        this.initialized = this.init();
    }
    addObject(nodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialized;
            return spinal_env_viewer_graph_service_1.SpinalGraphService.addChildInContext(this.spatialStartNode.id.get(), nodeId, this.context.info.id.get(), exports.SPATIAL_RELATION_NAME, spinal_env_viewer_graph_service_1.SPINAL_RELATION_TYPE);
        });
    }
    init() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield spinal_env_viewer_graph_service_1.SpinalGraphService.waitForInitialization();
                this.context = yield InvalidObjectManager.getContext();
                this.contextId = this.context.info.id.get();
                this.spatialStartNode = yield this.getSpatialStartNode();
                resolve(true);
            }
            catch (e) {
                console.error(e);
                resolve(false);
            }
        }));
    }
    getSpatialStartNode() {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService
                .getChildren(this.contextId, [exports.SPATIAL_START_NODE_RELATION_NAME]);
            for (let i = 0; i < children.length; i++) {
                if (children[i].name.get() === exports.SPATIAL_START_NODE_NAME) {
                    return children[i];
                }
            }
            const startNodeId = spinal_env_viewer_graph_service_1.SpinalGraphService.createNode({ name: exports.SPATIAL_START_NODE_NAME }, undefined);
            const contextId = this.context.info.id.get();
            yield spinal_env_viewer_graph_service_1.SpinalGraphService.addChildInContext(contextId, startNodeId, contextId, exports.SPATIAL_START_NODE_RELATION_NAME, spinal_env_viewer_graph_service_1.SPINAL_RELATION_TYPE);
            return spinal_env_viewer_graph_service_1.SpinalGraphService.getNode(startNodeId);
        });
    }
    static getContext() {
        return __awaiter(this, void 0, void 0, function* () {
            let context = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(exports.CONTEXT_NAME);
            if (typeof context === "undefined")
                context = yield InvalidObjectManager.createContext();
            return context;
        });
    }
    static createContext() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield spinal_env_viewer_graph_service_1.SpinalGraphService.addContext(exports.CONTEXT_NAME, 'SpinalSystem', undefined);
        });
    }
}
exports.InvalidObjectManager = InvalidObjectManager;
//# sourceMappingURL=InvalidObjectManager.js.map