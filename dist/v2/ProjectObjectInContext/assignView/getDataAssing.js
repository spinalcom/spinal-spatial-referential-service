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
exports.getDataAssing = void 0;
const utils_1 = require("../../utils");
function getParentRoom(node, contextGeo) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield node.getParentsInContext(contextGeo);
        return res[0];
    });
}
function getDataAssing({ contextId, selectedNodeId, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const graph = (0, utils_1.getGraph)();
        const contextGeo = yield (0, utils_1.getContextSpatial)(graph);
        const context = (0, utils_1.getRealNode)(contextId);
        const selectedNode = (0, utils_1.getRealNode)(selectedNodeId);
        const warn = [];
        const error = [];
        const children = yield selectedNode.getChildrenInContext(context);
        for (const child of children) {
            const arr = child.info.name.get() === 'error' ? error : warn;
            const items = yield child.getChildrenInContext(context);
            for (const item of items) {
                let PNId = '';
                let PName = '';
                if (child.info.name.get() === 'warn') {
                    // get parent ID
                    const parent = yield getParentRoom(item, contextGeo);
                    PNId = (parent === null || parent === void 0 ? void 0 : parent.info.id.get()) || '';
                    PName = (parent === null || parent === void 0 ? void 0 : parent.info.name.get()) || '';
                }
                arr.push({
                    name: item.info.name.get(),
                    PNId,
                    PName,
                    bimFileId: item.info.bimFileId.get(),
                    dbid: item.info.dbid.get(),
                    externalId: item.info.externalId.get(),
                    validId: '',
                });
            }
        }
        return {
            warn,
            error,
        };
    });
}
exports.getDataAssing = getDataAssing;
//# sourceMappingURL=getDataAssing.js.map