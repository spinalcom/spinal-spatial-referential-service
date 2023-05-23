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
exports.createCmdProjection = void 0;
const utils_1 = require("../../utils");
const getModelByModelId_1 = require("../../utils/projection/getModelByModelId");
const Constant_1 = require("../../../Constant");
const getProperties_1 = require("../../utils/projection/getProperties");
function createCmdProjection(intersects, contextGeoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = [];
        const dicoBimObjs = {};
        for (const spinalIntersection of intersects) {
            const bimObjectDbId = spinalIntersection.origin.dbId;
            const bimObjectModel = (0, getModelByModelId_1.getModelByModelId)(spinalIntersection.origin.modelId);
            const auProp = yield (0, getProperties_1.getProperties)(bimObjectModel, bimObjectDbId);
            const room = yield getIntersectionRoom(spinalIntersection.intersections.dbId, spinalIntersection.intersections.modelId, dicoBimObjs, contextGeoId);
            if (!room) {
                console.error(`createCmdProjection: room not found for ${bimObjectDbId}`);
            }
            else {
                createCmdProjItm(res, auProp, room.info.id.get());
            }
        }
        return res;
    });
}
exports.createCmdProjection = createCmdProjection;
function getIntersectionRoom(dbId, modelId, dicoBimObjs, contextGeoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomRefObjModel = (0, getModelByModelId_1.getModelByModelId)(modelId);
        const bimFileId = (0, utils_1.getBimFileIdByModelId)(roomRefObjModel.id);
        const refObj = yield getBimObjFromBimFileId(dicoBimObjs, bimFileId, dbId);
        const rooms = yield refObj.getParents(Constant_1.GEO_REFERENCE_ROOM_RELATION);
        const filteredRooms = rooms.filter((room) => {
            return (room.info.type.get() === Constant_1.GEO_ROOM_TYPE &&
                room.contextIds.has(contextGeoId));
        });
        const room = filteredRooms[0];
        return room;
    });
}
function getBimObjFromBimFileId(dico, bimFileId, bimObjectDbId) {
    return __awaiter(this, void 0, void 0, function* () {
        const bimObjs = yield getBimObjsOfBimFileId(dico, bimFileId);
        for (const bimObj of bimObjs) {
            if (bimObj.info.dbid.get() === bimObjectDbId) {
                return bimObj;
            }
        }
    });
}
function getBimObjsOfBimFileId(dico, bimFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const _bimObjs = dico[bimFileId];
        if (_bimObjs)
            return _bimObjs;
        const bimContext = yield (0, utils_1.getBimContextByBimFileId)(bimFileId);
        const bimObjs = yield bimContext.getChildren(Constant_1.GEO_EQUIPMENT_RELATION);
        dico[bimFileId] = bimObjs;
        return bimObjs;
    });
}
function getCategory(props) {
    for (const prop of props.properties) {
        // {displayName: "Category", displayValue: "Revit ", displayCategory: "__category__", attributeName: "Category", type: 20}
        if (prop.attributeName === 'Category' &&
            prop.displayCategory === '__category__') {
            return prop;
        }
    }
}
function createCmdProjItm(target, auProp, pNId) {
    const bimFileId = (0, utils_1.getBimFileIdByModelId)(auProp.modelId);
    const itm = target.find((it) => it.bimFileId === bimFileId && pNId === it.pNId);
    const revitCat = getCategory(auProp);
    if (itm) {
        const tmp = itm.data.find((it) => it.dbid === auProp.dbId);
        if (!tmp) {
            itm.data.push({
                dbid: auProp.dbId,
                externalId: auProp.externalId,
                name: auProp.name,
                revitCat: revitCat.displayValue,
            });
        }
    }
    else {
        target.push({
            type: 'CmdProjection',
            pNId,
            bimFileId,
            data: [
                {
                    dbid: auProp.dbId,
                    externalId: auProp.externalId,
                    name: auProp.name,
                    revitCat: revitCat.displayValue,
                },
            ],
        });
    }
}
//# sourceMappingURL=createCmdProjection.js.map