"use strict";
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
exports.getIntersectionRoom = void 0;
const utils_1 = require("../../utils");
const getModelByModelId_1 = require("../../utils/projection/getModelByModelId");
const Constant_1 = require("../../../Constant");
const getBimObjFromBimFileId_1 = require("./getBimObjFromBimFileId");
function getIntersectionRoom(dbId, modelId, dicoBimObjs, contextGeoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomRefObjModel = (0, getModelByModelId_1.getModelByModelId)(modelId);
        const bimFileId = (0, utils_1.getBimFileIdByModelId)(roomRefObjModel.id);
        const refObj = yield (0, getBimObjFromBimFileId_1.getBimObjFromBimFileId)(dicoBimObjs, bimFileId, dbId);
        const rooms = yield refObj.getParents(Constant_1.GEO_REFERENCE_ROOM_RELATION);
        const filteredRooms = rooms.filter((room) => {
            return (room.info.type.get() === Constant_1.GEO_ROOM_TYPE &&
                room.contextIds.has(contextGeoId));
        });
        const room = filteredRooms[0];
        return room;
    });
}
exports.getIntersectionRoom = getIntersectionRoom;
//# sourceMappingURL=getIntersectionRoom.js.map