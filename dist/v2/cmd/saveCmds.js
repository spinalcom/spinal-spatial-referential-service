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
exports.decode = exports.getCmdServId = exports.waitPathSendToHub = exports.saveCmds = exports.getContextGeneration = exports.GENERATION_GEO_TYPE = exports.GENERATION_RELATION = exports.GENERATION_TYPE = exports.GENERATION_CONTEXT_TYPE = exports.GENERATION_CONTEXT_NAME = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const compress_json_1 = require("compress-json");
const pako_1 = require("pako");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const graphservice_1 = require("../utils/graphservice");
exports.GENERATION_CONTEXT_NAME = 'Generation Context';
exports.GENERATION_CONTEXT_TYPE = 'GenerationContext';
exports.GENERATION_TYPE = 'GenerationType';
exports.GENERATION_RELATION = 'hasGeneration';
exports.GENERATION_GEO_TYPE = 'ContextSpatial';
function getContextGeneration() {
    return __awaiter(this, void 0, void 0, function* () {
        const graph = (0, graphservice_1.getGraph)();
        const contextRes = yield graph.getContext(exports.GENERATION_CONTEXT_NAME);
        if (contextRes)
            return contextRes;
        const context = new spinal_model_graph_1.SpinalContext(exports.GENERATION_CONTEXT_NAME, exports.GENERATION_CONTEXT_TYPE);
        yield graph.addContext(context);
        (0, graphservice_1.addNodeGraphService)(context);
        return context;
    });
}
exports.getContextGeneration = getContextGeneration;
function saveCmds(json, local = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield getContextGeneration();
        (0, compress_json_1.trimUndefinedRecursively)(json);
        const compressed = (0, pako_1.deflate)(JSON.stringify((0, compress_json_1.compress)(json)));
        const p = new spinal_core_connectorjs_1.Path();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p.file = compressed;
        p.remaining.set(compressed.length);
        p.to_upload.set(compressed.length);
        const node = new spinal_model_graph_1.SpinalNode(`ContextSpatial-${new Date().toISOString()}`, exports.GENERATION_TYPE, p);
        node.info.add_attr('generationType', exports.GENERATION_GEO_TYPE);
        node.info.add_attr('local', local);
        yield context.addChildInContext(node, exports.GENERATION_RELATION);
        return { node, data: p };
    });
}
exports.saveCmds = saveCmds;
function waitPathSendToHub(path) {
    return new Promise((resolve) => {
        const inter = setInterval(() => {
            if (path.remaining.get() === 0) {
                clearInterval(inter);
                resolve();
            }
        }, 100);
    });
}
exports.waitPathSendToHub = waitPathSendToHub;
function getCmdServId(node) {
    var _a;
    if (node.info.type.get() !== exports.GENERATION_TYPE)
        throw new Error(`getCmd, spinalnode in agument is not of type ${exports.GENERATION_TYPE}`);
    if (!node.element)
        throw new Error(`getCmd, spinalnode in agument have no Element`);
    return ((_a = node.element.ptr.data.model) === null || _a === void 0 ? void 0 : _a._server_id) || node.element.ptr.data.value;
}
exports.getCmdServId = getCmdServId;
function decode(compressed) {
    const ungzip = (0, pako_1.inflate)(compressed, { to: 'string' });
    const reversed = (0, compress_json_1.decompress)(JSON.parse(ungzip));
    return reversed;
}
exports.decode = decode;
//# sourceMappingURL=saveCmds.js.map