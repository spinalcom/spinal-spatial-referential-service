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
const AbstractEntityManager_1 = require("./AbstractEntityManager");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const spinal_models_building_elements_1 = require("spinal-models-building-elements");
class BuildingManager extends AbstractEntityManager_1.AbstractEntityManager {
    constructor() {
        super();
    }
    create(name, info, attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            let nodeId = spinal_env_viewer_graph_service_1.SpinalGraphService.createNode({
                name: name,
                type: spinal_env_viewer_context_geographic_service_1.default.constants.BUILDING_TYPE
            }, new spinal_models_building_elements_1.AbstractElement(name));
            yield this.addAttribute(spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(nodeId), attributes, info);
            return spinal_env_viewer_graph_service_1.SpinalGraphService.getNode(nodeId);
        });
    }
    getParents(node) {
        return __awaiter(this, void 0, void 0, function* () {
            let parents = yield node.getParents();
            for (let i = 0; i < parents.length; i++) {
                if (parents[i].info.type.get() === spinal_env_viewer_context_geographic_service_1.default.constants.CONTEXT_TYPE)
                    return parents[i];
            }
            return undefined;
        });
    }
    update(entityId, info) {
        return undefined;
    }
}
exports.BuildingManager = BuildingManager;
//# sourceMappingURL=BuildingManager.js.map