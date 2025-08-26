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
exports.diffRoomChildren = diffRoomChildren;
const IGetArchi_1 = require("../interfaces/IGetArchi");
const getNodeFromGeo_1 = require("./getNodeFromGeo");
const findNodeArchiWithSpinalNode_1 = require("./findNodeArchiWithSpinalNode");
const diffInfoAttr_1 = require("./diffInfoAttr");
function diffRoomChildren(floorNode, contextGeo, floorArchi, manualAssingment) {
    return __awaiter(this, void 0, void 0, function* () {
        const updateRooms = [];
        const newRooms = [];
        const delRooms = [];
        const proms = [];
        const roomNodes = yield floorNode.getChildrenInContext(contextGeo);
        for (const [, roomAchi] of Object.entries(floorArchi.children)) {
            const roomNode = yield (0, getNodeFromGeo_1.getNodeFromGeo)(roomNodes, roomAchi.properties, manualAssingment);
            if (!roomNode) {
                // not found
                newRooms.push(roomAchi);
                roomAchi.properties.modificationType = IGetArchi_1.EModificationType.create;
                roomAchi.properties.spinalnodeServerId = floorNode._server_id;
                continue;
            }
            proms.push((0, diffInfoAttr_1.diffInfoAttr)(roomAchi.properties, roomNode).then((diff) => {
                if (diff.diffAttr.length === 0 && diff.diffInfo.length === 0) {
                    return;
                }
                updateRooms.push({
                    roomArchi: roomAchi,
                    diff,
                });
            }));
        }
        yield Promise.all(proms);
        const nodeInfosArchi = Object.values(floorArchi.children).map((it) => it.properties);
        for (const roomNode of roomNodes) {
            const roomArchi = yield (0, findNodeArchiWithSpinalNode_1.findNodeArchiWithSpinalNode)(roomNode, nodeInfosArchi, manualAssingment);
            if (roomArchi === undefined) {
                delRooms.push(roomNode._server_id);
            }
        }
        return { newRooms, updateRooms, delRooms };
    });
}
//# sourceMappingURL=diffRoomChildren.js.map