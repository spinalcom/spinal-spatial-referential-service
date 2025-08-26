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
exports.getMergeBimGeoTrees = getMergeBimGeoTrees;
const constant_1 = require("../constant");
const utils_1 = require("../utils");
const ITreeItem_1 = require("./ITreeItem");
function getBimGeoItems(mapBimGeoInSpatial, spatialTree) {
    for (const child of spatialTree) {
        if (child.type === constant_1.BIM_GEO_FLOOR_PART_TYPE) {
            mapBimGeoInSpatial.set(child.id, child);
        }
        else {
            getBimGeoItems(mapBimGeoInSpatial, child.children);
        }
    }
}
function getMergeBimGeoTrees(spatialTree) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = [];
        const graph = (0, utils_1.getGraph)();
        const contexts = yield graph.getChildren();
        const bimGeoContexts = contexts.filter((context) => context.info.type.get() === constant_1.BIM_GEO_CONTEXT_TYPE);
        const mapBimGeoInSpatial = new Map();
        getBimGeoItems(mapBimGeoInSpatial, spatialTree);
        const promises = bimGeoContexts.map((context) => {
            return context.getChildrenInContext(context).then((children) => {
                return {
                    context,
                    children,
                };
            });
        });
        const items = yield Promise.all(promises);
        for (const { context, children } of items) {
            const itemRes = {
                id: context.info.id.get(),
                contextId: context.info.id.get(),
                name: context.info.name.get(),
                type: context.info.type.get(),
                status: ITreeItem_1.ETreeItemStatus.normal,
                children: children.map((floorNode) => {
                    return (mapBimGeoInSpatial.get(floorNode.info.id.get()) || {
                        id: floorNode.info.id.get(),
                        contextId: context.info.id.get(),
                        name: floorNode.info.name.get(),
                        type: constant_1.BIM_GEO_FLOOR_PART_TYPE,
                        status: ITreeItem_1.ETreeItemStatus.normal,
                        startStatus: ITreeItem_1.ETreeItemStatus.normal,
                        inGeoContext: false,
                        children: [],
                    });
                }),
            };
            res.push(itemRes);
        }
        return res;
    });
}
//# sourceMappingURL=getMergeBimGeoTrees.js.map