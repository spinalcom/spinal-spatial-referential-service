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
exports.getIntersects = getIntersects;
exports.pushToAggregateDbidByModel = pushToAggregateDbidByModel;
const raycastItemToMesh_1 = require("./raycastItemToMesh");
const getLeafDbIdsByModel_1 = require("../../utils/projection/getLeafDbIdsByModel");
const transformRtzToXyz_1 = require("../../utils/projection/transformRtzToXyz");
const isProjectionGroup_1 = require("../../utils/projection/isProjectionGroup");
const getModelByModelId_1 = require("../../utils/projection/getModelByModelId");
const getViewer_1 = require("../../utils/getViewer");
const getAll3dbIdsByModel_1 = require("../../utils/projection/getAll3dbIdsByModel");
function getIntersects(projectionGroupConfig, mergedRoomRef) {
    return __awaiter(this, void 0, void 0, function* () {
        const selection = [];
        projectionGroupConfig.progress = 0;
        try {
            const chunkSize = 50;
            const total = projectionGroupConfig.data.length;
            for (let start = 0; start < total; start += chunkSize) {
                const end = Math.min(start + chunkSize, total);
                const chunk = projectionGroupConfig.data.slice(start, end);
                for (let idx = 0; idx < chunk.length; idx++) {
                    const itemToProj = chunk[idx];
                    const _offset = (0, transformRtzToXyz_1.transformRtzToXyz)(itemToProj.offset);
                    if ((0, isProjectionGroup_1.isProjectionGroup)(itemToProj)) {
                        for (const itm of itemToProj.computedData) {
                            const model = (0, getModelByModelId_1.getModelByModelId)(itm.modelId);
                            let ids = [];
                            if (itemToProj.stopAtLeaf === true) {
                                ids = (0, getLeafDbIdsByModel_1.getLeafDbIdsByModel)(model, itm.dbId);
                            }
                            else {
                                ids = yield (0, getAll3dbIdsByModel_1.getAll3dbIdsByModel)(model, itm.dbId);
                            }
                            if (ids.length === 0)
                                continue;
                            pushToAggregateDbidByModel(selection, ids, model, _offset, itm.dbId);
                        }
                    }
                    else {
                        const model = (0, getModelByModelId_1.getModelByModelId)(itemToProj.modelId);
                        const ids = (0, getLeafDbIdsByModel_1.getLeafDbIdsByModel)(model, itemToProj.dbId);
                        pushToAggregateDbidByModel(selection, ids, model, _offset, itemToProj.dbId);
                    }
                    projectionGroupConfig.progress = ((start + idx + 1) / total) * 66;
                }
            }
            console.log('selection', selection);
            debugger;
            const intersects = yield (0, raycastItemToMesh_1.raycastItemToMesh)(selection, mergedRoomRef, (0, getViewer_1.getViewer)());
            projectionGroupConfig.progress = 100;
            return { selection, intersects };
        }
        catch (error) {
            projectionGroupConfig.progress = 100;
            console.error(error);
        }
    });
}
function pushToAggregateDbidByModel(targetArray, ids, model, offset, rootDbId) {
    for (const obj of targetArray) {
        if (obj.model === model) {
            for (const id of ids) {
                const findItem = obj.dbId.find((a) => a.dbId === id);
                const isFocus = rootDbId === id;
                if (findItem === undefined) {
                    obj.dbId.push({ dbId: id, offset, isFocus });
                }
                else if (isFocus === true && findItem.isFocus === false) {
                    findItem.isFocus = true;
                    findItem.offset = offset;
                }
            }
            return;
        }
    }
    const dbId = [];
    for (const id of ids) {
        const isFocus = rootDbId === id;
        dbId.push({ dbId: id, offset, isFocus });
    }
    targetArray.push({
        model,
        dbId,
    });
}
//# sourceMappingURL=getIntersects.js.map