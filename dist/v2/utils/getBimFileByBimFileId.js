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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBimFileByBimFileId = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const graphservice_1 = require("./graphservice");
let getBimFileByBimFileIdIt = null;
function getBimFileByBimFileId(bimFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!getBimFileByBimFileIdIt) {
            getBimFileByBimFileIdIt = _getBimFileByBimFileId(bimFileId);
        }
        const data = (yield getBimFileByBimFileIdIt.next(bimFileId)).value;
        if (data instanceof Error)
            throw data;
        return data;
    });
}
exports.getBimFileByBimFileId = getBimFileByBimFileId;
function _getBimFileByBimFileId(bimFileId) {
    return __asyncGenerator(this, arguments, function* _getBimFileByBimFileId_1() {
        let nextBimFileId = bimFileId;
        while (true) {
            const bimFile = (0, graphservice_1.getRealNode)(nextBimFileId);
            if (bimFile) {
                nextBimFileId = yield yield __await(bimFile);
                continue;
            }
            const graph = (0, graphservice_1.getGraph)();
            const context = yield __await(graph.getContext('BimFileContext'));
            if (!context) {
                nextBimFileId = yield yield __await(new Error('BimFileContext not found in graph'));
                continue;
            }
            const child = yield __await(context.getChild((node) => node.info.id.get() === nextBimFileId, 'hasBimFile', spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE));
            if (child) {
                nextBimFileId = yield yield __await(child);
            }
            else {
                nextBimFileId = yield yield __await(new Error(`BimFileId [${nextBimFileId}] not found`));
            }
        }
    });
}
//# sourceMappingURL=getBimFileByBimFileId.js.map