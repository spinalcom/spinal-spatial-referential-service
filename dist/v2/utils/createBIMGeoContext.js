"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBIMGeoContext = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const constant_1 = require("../constant");
const graphservice_1 = require("./graphservice");
function createBIMGeoContext(contextName) {
    const graph = (0, graphservice_1.getGraph)();
    const context = new spinal_model_graph_1.SpinalContext(contextName, constant_1.BIM_GEO_CONTEXT_TYPE);
    return graph.addContext(context);
}
exports.createBIMGeoContext = createBIMGeoContext;
//# sourceMappingURL=createBIMGeoContext.js.map