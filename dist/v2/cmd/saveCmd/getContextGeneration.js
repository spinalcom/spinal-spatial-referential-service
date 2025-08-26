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
exports.getContextGeneration = getContextGeneration;
const spinal_model_graph_1 = require("spinal-model-graph");
const graphservice_1 = require("../../utils/graphservice");
const constant_1 = require("../../constant");
function getContextGeneration() {
    return __awaiter(this, void 0, void 0, function* () {
        const graph = (0, graphservice_1.getGraph)();
        const contextRes = yield graph.getContext(constant_1.GENERATION_CONTEXT_NAME);
        if (contextRes)
            return contextRes;
        const context = new spinal_model_graph_1.SpinalContext(constant_1.GENERATION_CONTEXT_NAME, constant_1.GENERATION_CONTEXT_TYPE);
        yield graph.addContext(context);
        (0, graphservice_1.addNodeGraphService)(context);
        return context;
    });
}
//# sourceMappingURL=getContextGeneration.js.map