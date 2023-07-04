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
exports.getRefCmd = exports.getRoomCmd = exports.getRoomFromRefByName = exports.handleFloorCmdNew = void 0;
const transformArchi_1 = require("../../scripts/transformArchi");
const guid_1 = require("../../utils/guid");
const isInSkipList_1 = require("../../utils/archi/isInSkipList");
const Constant_1 = require("../../../Constant");
function handleFloorCmdNew(floorData, buildingNode, bimFileId, dataToDo, skipList, refContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const floorCmd = getFloorCmdNew(floorData, buildingNode, bimFileId);
        dataToDo.push([floorCmd]);
        // floor ref structs
        const floorRefCmds = getFloorRefCmdNew(floorData.floorArchi.structures, floorCmd.id, bimFileId, 'floorRef');
        // rooms
        const { roomCmds, roomRefCmds } = yield getFloorRoomsCmdNew(floorData, floorCmd, bimFileId, skipList, refContext);
        const floorRefAndRoomCmds = floorRefCmds.concat(roomCmds);
        if (floorRefAndRoomCmds.length > 0)
            dataToDo.push(floorRefAndRoomCmds);
        if (roomRefCmds.length > 0)
            dataToDo.push(roomRefCmds);
    });
}
exports.handleFloorCmdNew = handleFloorCmdNew;
function getFloorRoomsCmdNew(floorData, floorCmd, bimFileId, skipList, refContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomCmds = [];
        const roomRefCmds = [];
        for (const floorExtId in floorData.floorArchi.children) {
            if (Object.prototype.hasOwnProperty.call(floorData.floorArchi.children, floorExtId)) {
                const roomArchi = floorData.floorArchi.children[floorExtId];
                if ((0, isInSkipList_1.isInSkipList)(skipList, roomArchi.properties.externalId))
                    continue;
                yield getRoomCmd(roomArchi, floorCmd.id, bimFileId, roomCmds, roomRefCmds, refContext);
            }
        }
        return { roomCmds, roomRefCmds };
    });
}
function getRoomFromRefByName(refContext, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const children = yield refContext.getChildren(Constant_1.GEO_ROOM_RELATION);
        for (const child of children) {
            if (child.info.name.get() === name)
                return child;
        }
    });
}
exports.getRoomFromRefByName = getRoomFromRefByName;
function getRoomCmd(roomArchi, pNId, bimFileId, roomCmds, roomRefCmds, refContext) {
    return __awaiter(this, void 0, void 0, function* () {
        let name = '';
        let number = undefined;
        const attr = roomArchi.properties.properties.map((itm) => {
            if (itm.name === 'name')
                name = itm.value;
            if (itm.name === 'number')
                number = itm.value;
            return {
                label: itm.name,
                value: itm.value,
                unit: (0, transformArchi_1.parseUnit)(itm.dataTypeContext),
            };
        });
        name = number ? `${number}-${name}` : name;
        const node = yield getRoomFromRefByName(refContext, name);
        const id = node ? node.info.id.get() : (0, guid_1.guid)();
        const roomCmd = {
            pNId,
            id,
            type: 'room',
            name,
            info: {
                dbid: roomArchi.properties.dbId,
                externalId: roomArchi.properties.externalId,
                bimFileId,
            },
            attr,
        };
        roomCmds.push(roomCmd);
        roomArchi.children.forEach((nodeInfo) => {
            const roomRefCmd = getRefCmd(nodeInfo, roomCmd.id, 'roomRef', bimFileId);
            roomRefCmds.push(roomRefCmd);
        });
    });
}
exports.getRoomCmd = getRoomCmd;
function getFloorRefCmdNew(structures, floorId, bimFileId, type) {
    const refObjs = [];
    for (const RefExtId in structures) {
        if (Object.prototype.hasOwnProperty.call(structures, RefExtId)) {
            const { properties } = structures[RefExtId];
            const struct = getRefCmd(properties, floorId, type, bimFileId);
            refObjs.push(struct);
        }
    }
    return refObjs;
}
function getRefCmd(properties, pNId, type, bimFileId) {
    let name = '';
    properties.properties.forEach((itm) => {
        if (itm.name === 'name')
            name = itm.value;
    });
    return {
        pNId,
        id: (0, guid_1.guid)(),
        type,
        name,
        info: {
            dbid: properties.dbId,
            externalId: properties.externalId,
            bimFileId,
        },
    };
}
exports.getRefCmd = getRefCmd;
function getFloorCmdNew(floorData, buildingNode, bimFileId) {
    const info = {
        dbid: floorData.floorArchi.properties.dbId,
        externalId: floorData.floorArchi.properties.externalId,
        bimFileId,
    };
    let name = '';
    const attr = floorData.floorArchi.properties.properties.map((itm) => {
        if (itm.name === 'name')
            name = itm.value;
        return {
            label: itm.name,
            value: itm.value,
            unit: (0, transformArchi_1.parseUnit)(itm.dataTypeContext),
        };
    });
    return {
        pNId: buildingNode.info.id.get(),
        id: (0, guid_1.guid)(),
        type: 'floor',
        name,
        info,
        attr,
    };
}
//# sourceMappingURL=handleFloorCmdNew.js.map