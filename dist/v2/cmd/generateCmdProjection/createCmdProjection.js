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
const graphservice_1 = require("../../utils/graphservice");
const getModelByModelId_1 = require("../../utils/projection/getModelByModelId");
const getProperties_1 = require("../../utils/projection/getProperties");
const getIntersectionRoom_1 = require("./getIntersectionRoom");
const createCmdProjItm_1 = require("./createCmdProjItm");
const getCenterPos_1 = require("./getCenterPos");
const consumeBatch_1 = require("../../../utils/consumeBatch");
function createCmdProjection(intersects, contextGeoId, floorsData) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = [];
        const dicoBimObjs = {};
        const proms = [];
        for (const spinalIntersection of intersects) {
            proms.push(() => handleCreateCmd(spinalIntersection, dicoBimObjs, contextGeoId, floorsData, res));
        }
        yield (0, consumeBatch_1.consumeBatch)(proms, 20, console.log.bind(null, 'createCmdProjection %d/%d'));
        return res;
    });
}
exports.createCmdProjection = createCmdProjection;
function handleCreateCmd(spinalIntersection, dicoBimObjs, contextGeoId, floorsData, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const bimObjectDbId = spinalIntersection.origin.dbId;
        const bimObjectModel = (0, getModelByModelId_1.getModelByModelId)(spinalIntersection.origin.modelId);
        const auProp = yield (0, getProperties_1.getProperties)(bimObjectModel, bimObjectDbId);
        const room = yield (0, getIntersectionRoom_1.getIntersectionRoom)(spinalIntersection.intersections.dbId, spinalIntersection.intersections.modelId, dicoBimObjs, contextGeoId);
        let flagWarining = false;
        const floor = yield getFloorFromRoom(room, contextGeoId);
        if (floor) {
            const floorData = floorsData[floor.info.id.get()];
            if (floorData &&
                floorData.distance &&
                spinalIntersection.intersections.distance > floorData.distance) {
                flagWarining = true;
            }
        }
        if (!room) {
            console.error(`createCmdProjection: room not found for ${bimObjectDbId}`);
        }
        else {
            const centerPos = yield (0, getCenterPos_1.getCenterPos)(auProp);
            (0, createCmdProjItm_1.createCmdProjItm)(res, auProp, room.info.id.get(), centerPos, flagWarining);
        }
    });
}
function getFloorFromRoom(room, contextGeoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const contextGeo = (0, graphservice_1.getRealNode)(contextGeoId);
        const floors = yield room.getParentsInContext(contextGeo);
        for (const floor of floors) {
            return floor;
        }
    });
}
//# sourceMappingURL=createCmdProjection.js.map