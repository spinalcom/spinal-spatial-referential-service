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
exports.generateCmdBIMGeo = exports.generateCmdGeo = void 0;
const IGetArchi_1 = require("../../interfaces/IGetArchi");
const getModType_1 = require("../../utils/archi/getModType");
const isInSkipList_1 = require("../../utils/archi/isInSkipList");
const handleFloorCmdNew_1 = require("./handleFloorCmdNew");
const handleFloorUpdate_1 = require("./handleFloorUpdate");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const getOrLoadModel_1 = require("../../utils/getOrLoadModel");
const utils_1 = require("../../utils");
function generateCmdGeo(data, skipList, buildingServerId, bimFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataToDo = [];
        const buildingNode = yield (0, getOrLoadModel_1.getOrLoadModel)(buildingServerId);
        const refContext = yield (0, spinal_env_viewer_context_geographic_service_1.getOrCreateRefContext)(spinal_env_viewer_context_geographic_service_1.ROOM_REFERENCE_CONTEXT);
        const graph = (0, utils_1.getGraph)();
        const contextGeo = yield (0, utils_1.getContextSpatial)(graph);
        yield generateCmdGeoLoop(data, skipList, buildingNode.info.id.get(), dataToDo, bimFileId, refContext, contextGeo.info.id.get());
        return dataToDo;
    });
}
exports.generateCmdGeo = generateCmdGeo;
function generateCmdBIMGeo(data, skipList, BIMGeocontextServId, bimFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataToDo = [];
        const context = yield (0, getOrLoadModel_1.getOrLoadModel)(BIMGeocontextServId);
        const refContext = yield (0, spinal_env_viewer_context_geographic_service_1.getOrCreateRefContext)(spinal_env_viewer_context_geographic_service_1.ROOM_REFERENCE_CONTEXT);
        const contextId = context.info.id.get();
        yield generateCmdGeoLoop(data, skipList, contextId, dataToDo, bimFileId, refContext, contextId);
        return dataToDo;
    });
}
exports.generateCmdBIMGeo = generateCmdBIMGeo;
function generateCmdGeoLoop(data, skipList, parentNodeId, dataToDo, bimFileId, refContext, contextId) {
    return __awaiter(this, void 0, void 0, function* () {
        const floors = [];
        const floorRefs = [];
        const rooms = [];
        const roomRefs = [];
        const itemDeletes = [];
        for (const floorData of data) {
            if ((0, isInSkipList_1.isInSkipList)(skipList, floorData.floorArchi.properties.externalId))
                continue;
            switch ((0, getModType_1.getModType)(floorData.floorArchi.properties.modificationType)) {
                case IGetArchi_1.EModificationType.update:
                case IGetArchi_1.EModificationType.none:
                    if (!floorData.diff) {
                        console.warn(`${floorData.floorArchi.properties.externalId} got update modification type but no Diff object`);
                    }
                    else {
                        yield (0, handleFloorUpdate_1.handleFloorUpdate)(floorData, parentNodeId, skipList, bimFileId, refContext, contextId, floors, floorRefs, rooms, roomRefs, itemDeletes);
                    }
                    break;
                case IGetArchi_1.EModificationType.create:
                    yield (0, handleFloorCmdNew_1.handleFloorCmdNew)(floorData, parentNodeId, bimFileId, skipList, refContext, contextId, floors, floorRefs, rooms, roomRefs);
                    break;
                default:
                    // do nothing | no delete floor
                    break;
            }
        }
        if (floors.length > 0)
            dataToDo.push(floors);
        if (floorRefs.length > 0)
            dataToDo.push(floorRefs);
        if (rooms.length > 0)
            dataToDo.push(rooms);
        if (roomRefs.length > 0)
            dataToDo.push(roomRefs);
        if (itemDeletes.length > 0)
            dataToDo.push(itemDeletes);
    });
}
//# sourceMappingURL=generateCmdGeo.js.map