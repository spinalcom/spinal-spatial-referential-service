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
exports.pushToAggregateDbidByModel = exports.getIntersects = void 0;
const raycastItemToMesh_1 = require("./raycastItemToMesh");
const getLeafDbIdsByModel_1 = require("../../utils/projection/getLeafDbIdsByModel");
const transformRtzToXyz_1 = require("../../utils/projection/transformRtzToXyz");
const isProjectionGroup_1 = require("../../utils/projection/isProjectionGroup");
const getModelByModelId_1 = require("../../utils/projection/getModelByModelId");
const getRoomRef_1 = require("./getRoomRef");
const utils_1 = require("../../utils");
function getIntersects(projectionGroupConfig, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const selection = [];
        projectionGroupConfig.progress = 0;
        try {
            for (let idx = 0; idx < projectionGroupConfig.data.length; idx++) {
                const itemToProj = projectionGroupConfig.data[idx];
                const _offset = (0, transformRtzToXyz_1.transformRtzToXyz)(itemToProj.offset);
                if ((0, isProjectionGroup_1.isProjectionGroup)(itemToProj)) {
                    for (const itm of itemToProj.computedData) {
                        const model = (0, getModelByModelId_1.getModelByModelId)(itm.modelId);
                        const ids = (0, getLeafDbIdsByModel_1.getLeafDbIdsByModel)(model, itm.dbId);
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
                projectionGroupConfig.progress =
                    (projectionGroupConfig.data.length / (idx + 1)) * 33;
            }
            const to = yield (0, getRoomRef_1.getRoomRef)(context);
            projectionGroupConfig.progress = 66;
            const intersects = yield (0, raycastItemToMesh_1.raycastItemToMesh)(selection, to, (0, utils_1.getViewer)());
            projectionGroupConfig.progress = 100;
            return { selection, intersects };
        }
        catch (error) {
            projectionGroupConfig.progress = 100;
            console.error(error);
        }
    });
}
exports.getIntersects = getIntersects;
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
exports.pushToAggregateDbidByModel = pushToAggregateDbidByModel;
//# sourceMappingURL=getIntersects.js.map