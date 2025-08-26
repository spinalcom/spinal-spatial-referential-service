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
exports.getRoomRef = getRoomRef;
exports.pushToAggregateSetDbidByModel = pushToAggregateSetDbidByModel;
const Constant_1 = require("../../../Constant");
const getModelByBimFileIdLoaded_1 = require("../../utils/projection/getModelByBimFileIdLoaded");
function getRoomRef(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = [];
        const relNames = [
            Constant_1.GEO_SITE_RELATION,
            Constant_1.GEO_BUILDING_RELATION,
            Constant_1.GEO_FLOOR_RELATION,
            Constant_1.GEO_ROOM_RELATION,
            Constant_1.GEO_ZONE_RELATION,
        ];
        // get rooms nodes
        const rooms = yield context.find(relNames, (node) => {
            return node.getType().get() === Constant_1.GEO_ROOM_TYPE;
        });
        // get refObjet from rooms nodes
        const refObjsProm = rooms.map((room) => {
            return room.getChildren([Constant_1.GEO_REFERENCE_ROOM_RELATION]);
        });
        const refObjs = yield Promise.all(refObjsProm);
        // merge result by model
        for (const refs of refObjs) {
            for (const ref of refs) {
                if (ref.getType().get() === Constant_1.GEO_EQUIPMENT_TYPE) {
                    const bimFileId = ref.info.bimFileId.get();
                    const model = (0, getModelByBimFileIdLoaded_1.getModelByBimFileIdLoaded)(bimFileId);
                    if (model) {
                        const dbId = ref.info.dbid.get();
                        pushToAggregateSetDbidByModel(result, dbId, model);
                    }
                }
            }
        }
        return result;
    });
}
function pushToAggregateSetDbidByModel(targetArray, id, model) {
    if (id === -1)
        return;
    for (const obj of targetArray) {
        if (obj.model === model) {
            obj.dbId.add(id);
            return;
        }
    }
    const idSet = new Set();
    idSet.add(id);
    targetArray.push({
        model,
        dbId: idSet,
    });
}
//# sourceMappingURL=getRoomRef.js.map