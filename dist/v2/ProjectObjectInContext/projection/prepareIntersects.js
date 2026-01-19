"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
exports.prepareIntersects = prepareIntersects;
const getLeafDbIdsByModel_1 = require("../../utils/projection/getLeafDbIdsByModel");
const transformRtzToXyz_1 = require("../../utils/projection/transformRtzToXyz");
const isProjectionGroup_1 = require("../../utils/projection/isProjectionGroup");
const getModelByModelId_1 = require("../../utils/projection/getModelByModelId");
const getAll3dbIdsByModel_1 = require("../../utils/projection/getAll3dbIdsByModel");
const pushToAggregateDbidByModel_1 = require("./pushToAggregateDbidByModel");
function prepareIntersects(projectionGroupConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const itemsToIntersect = [];
        const itemsToAproximate = [];
        projectionGroupConfig.progress = 0;
        try {
            let proms = [];
            for (let idx = 0; idx < projectionGroupConfig.data.length; idx++) {
                const itemToProj = projectionGroupConfig.data[idx];
                const _offset = (0, transformRtzToXyz_1.transformRtzToXyz)(itemToProj.offset);
                if ((0, isProjectionGroup_1.isProjectionGroup)(itemToProj)) {
                    for (const itm of itemToProj.computedData) {
                        proms.push(processProjectionData(itm.modelId, itm.dbId, itemsToAproximate, _offset, itemsToIntersect, itemToProj.stopAtLeaf, itemToProj.aproximateByLevel));
                    }
                }
                else {
                    proms.push(processProjectionData(itemToProj.modelId, itemToProj.dbId, itemsToAproximate, _offset, itemsToIntersect, itemToProj.stopAtLeaf, itemToProj.aproximateByLevel));
                }
                if (proms.length >= 200) {
                    projectionGroupConfig.progress =
                        ((idx + 1) / projectionGroupConfig.data.length) * 100;
                    yield Promise.all(proms);
                    proms = [];
                }
            }
            yield Promise.all(proms);
            projectionGroupConfig.progress = 100;
            return { itemsToAproximate, itemsToIntersect };
        }
        catch (error) {
            projectionGroupConfig.progress = 100;
            console.error(error);
        }
    });
}
function processProjectionData(modelId, dbId, itemsToAproximate, _offset, itemsToIntersect, stopAtLeaf, aproximateByLevel) {
    return __awaiter(this, void 0, void 0, function* () {
        const model = (0, getModelByModelId_1.getModelByModelId)(modelId);
        let ids = [];
        if (stopAtLeaf === true) {
            ids = (0, getLeafDbIdsByModel_1.getLeafDbIdsByModel)(model, dbId);
        }
        else {
            ids = yield (0, getAll3dbIdsByModel_1.getAll3dbIdsByModel)(model, dbId);
        }
        if (ids.length === 0)
            return;
        if (aproximateByLevel === true) {
            (0, pushToAggregateDbidByModel_1.pushToAggregateDbidByModel)(itemsToAproximate, ids, model, _offset, dbId);
        }
        else {
            (0, pushToAggregateDbidByModel_1.pushToAggregateDbidByModel)(itemsToIntersect, ids, model, _offset, dbId);
        }
    });
}
//# sourceMappingURL=prepareIntersects.js.map