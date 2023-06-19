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
exports.getRoomNodeFromSelectFloor = void 0;
const utils_1 = require("../../utils");
const Constant_1 = require("../../../Constant");
function getRoomNodeFromSelectFloor() {
    return __awaiter(this, void 0, void 0, function* () {
        const bimObj = yield getFloorSelectedBimObj();
        if (bimObj) {
            const parents = yield bimObj.getParents(Constant_1.GEO_REFERENCE_ROOM_RELATION);
            return parents[0];
        }
    });
}
exports.getRoomNodeFromSelectFloor = getRoomNodeFromSelectFloor;
function getFloorSelectedBimObj() {
    return __awaiter(this, void 0, void 0, function* () {
        const aggregateSelection = (0, utils_1.getViewer)().getAggregateSelection();
        const { model, dbid } = get1stDbidFromAggre(aggregateSelection);
        if (!model && !dbid)
            return;
        const bimFileId = getBimFileIdByModelId(model.id);
        const bimContext = yield (0, utils_1.getBimContextByBimFileId)(bimFileId);
        const bimobjs = yield bimContext.getChildren(Constant_1.GEO_EQUIPMENT_RELATION);
        for (const bimObj of bimobjs) {
            if (bimObj.info.dbid.get() === dbid)
                return bimObj;
        }
    });
}
function get1stDbidFromAggre(aggregateSelection) {
    for (const { model, selection } of aggregateSelection) {
        return { model, dbid: selection[0] };
    }
}
function getBimFileIdByModelId(modelId) {
    const mappingBimFileIdModelId = window.spinal.BimObjectService.mappingBimFileIdModelId;
    for (const bimFileId in mappingBimFileIdModelId) {
        if (Object.prototype.hasOwnProperty.call(mappingBimFileIdModelId, bimFileId)) {
            const obj = mappingBimFileIdModelId[bimFileId];
            if (obj.modelId === modelId) {
                for (const { model } of obj.modelScene) {
                    if (model.id === modelId)
                        return bimFileId;
                }
            }
        }
    }
}
//# sourceMappingURL=getRoomNameFromSelectFloor.js.map