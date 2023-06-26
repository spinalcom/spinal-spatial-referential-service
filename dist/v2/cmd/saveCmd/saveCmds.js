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
exports.saveCmds = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const compress_json_1 = require("compress-json");
const pako_1 = require("pako");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const constant_1 = require("../../constant");
const getContextGeneration_1 = require("./getContextGeneration");
const utils_1 = require("../../utils");
function saveCmds(json, generationType, local) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield (0, getContextGeneration_1.getContextGeneration)();
        (0, compress_json_1.trimUndefinedRecursively)(json);
        const compressed = (0, pako_1.deflate)(JSON.stringify((0, compress_json_1.compress)(json)));
        const p = new spinal_core_connectorjs_1.Path();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p.file = compressed;
        p.remaining.set(compressed.length);
        p.to_upload.set(compressed.length);
        const node = new spinal_model_graph_1.SpinalNode(`${generationType}-${new Date().toISOString()}`, constant_1.GENERATION_TYPE, p);
        (0, utils_1.addNodeGraphService)(node);
        node.info.add_attr('generationType', generationType);
        node.info.add_attr('local', local);
        yield context.addChildInContext(node, constant_1.GENERATION_RELATION);
        return { node, context, data: p };
    });
}
exports.saveCmds = saveCmds;
//# sourceMappingURL=saveCmds.js.map