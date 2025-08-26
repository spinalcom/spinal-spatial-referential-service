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
exports.getMergeSpatialTree = getMergeSpatialTree;
const utils_1 = require("../utils");
const Constant_1 = require("../../Constant");
const ITreeItem_1 = require("./ITreeItem");
const constant_1 = require("../constant");
function getMergeSpatialTree(contextGeoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const contextGeo = (0, utils_1.getRealNode)(contextGeoId);
        const contextItem = {
            id: contextGeo.info.id.get(),
            name: contextGeo.info.name.get(),
            type: contextGeo.info.type.get(),
            status: ITreeItem_1.ETreeItemStatus.normal,
            contextId: contextGeo.info.id.get(),
            children: [],
        };
        const res = [contextItem];
        yield handleSpatialCreateTreeRec(contextItem.children, contextGeo, contextGeo);
        return res;
    });
}
function handleSpatialCreateTreeRec(targetArr, contextGeo, child) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isSpinalNodeTypeFloor(child)) {
            return getBimContextLinked(targetArr, child);
        }
        const children = yield child.getChildrenInContext(contextGeo);
        for (const child of children) {
            const childData = {
                id: child.info.id.get(),
                name: child.info.name.get(),
                type: child.info.type.get(),
                contextId: contextGeo.info.id.get(),
                status: ITreeItem_1.ETreeItemStatus.normal,
                children: [],
            };
            targetArr.push(childData);
            yield handleSpatialCreateTreeRec(childData.children, contextGeo, child);
        }
    });
}
function isSpinalNodeTypeFloor(node) {
    return node.info.type.get() === Constant_1.GEO_FLOOR_TYPE;
}
function getBimContextLinked(targetArr, child) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof child.info.linkedBimGeos === 'undefined')
            return;
        for (const linkedBimGeo of child.info.linkedBimGeos) {
            const contextId = linkedBimGeo.contextId.get();
            const floorId = linkedBimGeo.floorId.get();
            const name = yield getFloorName(contextId, floorId);
            targetArr.push({
                id: floorId,
                name,
                contextId,
                type: constant_1.BIM_GEO_FLOOR_PART_TYPE,
                inGeoContext: true,
                status: name === 'unknown' ? ITreeItem_1.ETreeItemStatus.unknown : ITreeItem_1.ETreeItemStatus.normal,
                startStatus: name === 'unknown' ? ITreeItem_1.ETreeItemStatus.unknown : ITreeItem_1.ETreeItemStatus.normal,
                children: [],
            });
        }
    });
}
function getFloorName(contextId, floorId) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = (0, utils_1.getRealNode)(contextId);
        const children = yield context.getChildrenInContext(context);
        for (const child of children) {
            if (child.info.id.get() === floorId)
                return child.info.name.get();
        }
        return 'unknown';
    });
}
//# sourceMappingURL=getMergeSpatialTree.js.map