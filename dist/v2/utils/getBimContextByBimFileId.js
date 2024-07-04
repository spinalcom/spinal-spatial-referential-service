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
exports.getBimContextByBimFileId = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_model_graph_2 = require("spinal-model-graph");
const getBimFileByBimFileId_1 = require("./getBimFileByBimFileId");
const constant_1 = require("../constant");
const createBimContextIt = new Map();
function getBimContextByBimFileId(bimFileId_1) {
    return __awaiter(this, arguments, void 0, function* (bimFileId, doCreate = false) {
        const bimFile = yield (0, getBimFileByBimFileId_1.getBimFileByBimFileId)(bimFileId);
        const bimContexts = yield bimFile.getChildren(constant_1.BIMCONTEXT_RELATION_NAME);
        if (bimContexts.length > 0) {
            return bimContexts[0];
        }
        if (doCreate === true) {
            let it = createBimContextIt.get(bimFileId);
            if (!it) {
                it = _createBimContext(bimFile);
                createBimContextIt.set(bimFileId, it);
            }
            return (yield it.next()).value;
        }
    });
}
exports.getBimContextByBimFileId = getBimContextByBimFileId;
function _createBimContext(bimFile) {
    return __asyncGenerator(this, arguments, function* _createBimContext_1() {
        const bimContext = new spinal_model_graph_1.SpinalNode('BIMContext', 'SpinalNode');
        yield __await(bimFile.addChild(bimContext, constant_1.BIMCONTEXT_RELATION_NAME, spinal_model_graph_2.SPINAL_RELATION_PTR_LST_TYPE));
        while (true) {
            yield yield __await(bimContext);
        }
    });
}
//# sourceMappingURL=getBimContextByBimFileId.js.map