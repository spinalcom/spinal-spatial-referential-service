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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefCmd = exports.getRoomCmd = exports.handleFloorCmdNew = void 0;
const transformArchi_1 = require("../transformArchi");
const guid_1 = require("../utils/guid");
const isInSkipList_1 = require("../utils/isInSkipList");
function handleFloorCmdNew(floorData, buildingNode, bimFileId, dataToDo, skipList) {
    const floorCmd = getFloorCmdNew(floorData, buildingNode, bimFileId);
    dataToDo.push([floorCmd]);
    // floor ref structs
    const floorRefCmds = getFloorRefCmdNew(floorData.floorArchi.structures, floorCmd.id, bimFileId, 'floorRef');
    // rooms
    const { roomCmds, roomRefCmds } = getFloorRoomsCmdNew(floorData, floorCmd, bimFileId, skipList);
    const floorRefAndRoomCmds = floorRefCmds.concat(roomCmds);
    if (floorRefAndRoomCmds.length > 0)
        dataToDo.push(floorRefAndRoomCmds);
    if (roomRefCmds.length > 0)
        dataToDo.push(roomRefCmds);
}
exports.handleFloorCmdNew = handleFloorCmdNew;
function getFloorRoomsCmdNew(floorData, floorCmd, bimFileId, skipList) {
    const roomCmds = [];
    const roomRefCmds = [];
    for (const floorExtId in floorData.floorArchi.children) {
        if (Object.prototype.hasOwnProperty.call(floorData.floorArchi.children, floorExtId)) {
            const roomArchi = floorData.floorArchi.children[floorExtId];
            if ((0, isInSkipList_1.isInSkipList)(skipList, roomArchi.properties.externalId))
                continue;
            getRoomCmd(roomArchi, floorCmd.id, bimFileId, roomCmds, roomRefCmds);
        }
    }
    return { roomCmds, roomRefCmds };
}
function getRoomCmd(roomArchi, pNId, bimFileId, roomCmds, roomRefCmds) {
    console.log('getRoomCmd');
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
    const roomCmd = {
        pNId,
        id: (0, guid_1.guid)(),
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