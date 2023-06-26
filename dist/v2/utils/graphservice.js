"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfoGraphService = exports.getRealNode = exports.getGraph = exports.addNodeGraphService = void 0;
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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
function addNodeGraphService(node) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
}
exports.addNodeGraphService = addNodeGraphService;
function getGraph() {
    return spinal_env_viewer_graph_service_1.SpinalGraphService.getGraph();
}
exports.getGraph = getGraph;
function getRealNode(nodeId) {
    return spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(nodeId);
}
exports.getRealNode = getRealNode;
function getInfoGraphService(nodeId) {
    return spinal_env_viewer_graph_service_1.SpinalGraphService.getInfo(nodeId);
}
exports.getInfoGraphService = getInfoGraphService;
//# sourceMappingURL=graphservice.js.map