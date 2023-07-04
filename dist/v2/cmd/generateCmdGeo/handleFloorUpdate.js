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
exports.handleFloorUpdate = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const isInSkipList_1 = require("../../utils/archi/isInSkipList");
const handleFloorCmdNew_1 = require("./handleFloorCmdNew");
const transformArchi_1 = require("../../scripts/transformArchi");
const guid_1 = require("../../utils/guid");
const getNodeInfoArchiAttr_1 = require("../../utils/archi/getNodeInfoArchiAttr");
const serverIdArrToNodeIdArr_1 = require("../../utils/archi/serverIdArrToNodeIdArr");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
function handleFloorUpdate(floorData, buildingNode, dataToDo, skipList, bimFileId, refContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const floorNode = (spinal_core_connectorjs_1.FileSystem._objects[floorData.floorArchi.properties.spinalnodeServerId]);
        const floorCmd = getFloorCmdUp(floorData, buildingNode, floorNode);
        dataToDo.push([floorCmd]);
        const floorCmds = [];
        if (floorData.diff.diffRef.delBimObj.length > 0) {
            const delBimObj = {
                pNId: floorNode.info.id.get(),
                type: 'floorRefDel',
                nIdToDel: (0, serverIdArrToNodeIdArr_1.serverIdArrToNodeIdArr)(floorData.diff.diffRef.delBimObj),
            };
            floorCmds.push(delBimObj);
        }
        const roomDelServerId = floorData.diff.diffRoom.delRooms.filter((itm) => !(0, isInSkipList_1.isInSkipList)(skipList, itm));
        if (roomDelServerId.length > 0) {
            const floorRoomDel = {
                pNId: floorNode.info.id.get(),
                type: 'floorRoomDel',
                nIdToDel: (0, serverIdArrToNodeIdArr_1.serverIdArrToNodeIdArr)(roomDelServerId),
            };
            floorCmds.push(floorRoomDel);
        }
        if (floorCmds.length > 0)
            dataToDo.push(floorCmds);
        const floorRefCmd = getFloorRefCmd(floorData, floorNode, bimFileId);
        const roomCmds = [], roomRefCmds = [];
        floorData.diff.diffRoom.newRooms.forEach((roomArchi) => {
            if (!(0, isInSkipList_1.isInSkipList)(skipList, roomArchi.properties.externalId))
                (0, handleFloorCmdNew_1.getRoomCmd)(roomArchi, floorNode.info.id.get(), bimFileId, roomCmds, roomRefCmds, refContext);
        });
        yield getRoomCmdUp(floorData, floorNode, roomCmds, bimFileId, roomRefCmds, skipList);
        const floorRefAndRoomCmds = floorRefCmd.concat(roomCmds);
        if (floorRefAndRoomCmds.length > 0)
            dataToDo.push(floorRefAndRoomCmds);
        if (roomRefCmds.length > 0)
            dataToDo.push(roomRefCmds);
    });
}
exports.handleFloorUpdate = handleFloorUpdate;
function getRoomCmdUp(floorData, floorNode, roomCmds, bimFileId, roomRefCmds, skipList) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const updatedRoomSet = new Set();
        floorData.diff.diffRoom.newRooms.forEach((roomArchi) => {
            updatedRoomSet.add(roomArchi.properties.externalId);
        });
        for (const { diff, roomArchi } of floorData.diff.diffRoom.updateRooms) {
            updatedRoomSet.add(roomArchi.properties.externalId);
            if ((0, isInSkipList_1.isInSkipList)(skipList, roomArchi.properties.externalId))
                continue;
            const { name, attr, info } = getRoomNameAndAttr(roomArchi, diff);
            const roomNode = (spinal_core_connectorjs_1.FileSystem._objects[roomArchi.properties.spinalnodeServerId]);
            const roomCmd = {
                pNId: floorNode.info.id.get(),
                id: ((_a = roomNode === null || roomNode === void 0 ? void 0 : roomNode.info.id) === null || _a === void 0 ? void 0 : _a.get()) || (0, guid_1.guid)(),
                type: 'room',
                name,
                info,
                attr,
            };
            roomCmds.push(roomCmd);
            roomArchi.children.forEach((nodeInfo) => {
                const roomRefCmd = (0, handleFloorCmdNew_1.getRefCmd)(nodeInfo, roomCmd.id, 'roomRef', bimFileId);
                roomRefCmds.push(roomRefCmd);
            });
        }
        const proms = [];
        for (const roomExtId in floorData.floorArchi.children) {
            if (Object.prototype.hasOwnProperty.call(floorData.floorArchi.children, roomExtId)) {
                const roomArchi = floorData.floorArchi.children[roomExtId];
                if (updatedRoomSet.has(roomExtId))
                    continue;
                if ((0, isInSkipList_1.isInSkipList)(skipList, roomExtId))
                    continue;
                // get realNode
                const roomNode = (spinal_core_connectorjs_1.FileSystem._objects[roomArchi.properties.spinalnodeServerId]);
                if (!roomNode)
                    continue;
                proms.push(roomNode
                    .getChildren(spinal_env_viewer_context_geographic_service_1.REFERENCE_ROOM_RELATION)
                    .then((children) => {
                    var _a;
                    return {
                        children,
                        roomArchi,
                        roomCmd: {
                            pNId: floorNode.info.id.get(),
                            id: ((_a = roomNode === null || roomNode === void 0 ? void 0 : roomNode.info.id) === null || _a === void 0 ? void 0 : _a.get()) || (0, guid_1.guid)(),
                            type: 'RefNode',
                        },
                    };
                }));
            }
        }
        const cmds = yield Promise.all(proms);
        for (const { children, roomCmd, roomArchi } of cmds) {
            const roomRefCmds2 = [];
            const refsToRm = [];
            // check child to remove
            for (const child of children) {
                let found = false;
                for (const nodeInfo of roomArchi.children) {
                    if (child.info.dbid.get() === nodeInfo.dbId &&
                        child.info.bimFileId.get() === bimFileId) {
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    refsToRm.push(child.info.externalId.get());
                }
            }
            roomArchi.children.forEach((nodeInfo) => {
                // check if it exist
                for (const child of children) {
                    if (child.info.externalId.get() === nodeInfo.externalId)
                        return;
                }
                // if not exist add to list createRef
                const roomRefCmd = (0, handleFloorCmdNew_1.getRefCmd)(nodeInfo, roomCmd.id, 'roomRef', bimFileId);
                roomRefCmds2.push(roomRefCmd);
            });
            if (refsToRm.length > 0 || roomRefCmds2.length > 0) {
                roomCmds.push(roomCmd);
                if (refsToRm.length > 0) {
                    roomRefCmds.push({
                        pNId: roomCmd.id,
                        type: 'roomRefDel',
                        nIdToDel: refsToRm,
                    });
                }
                if (roomRefCmds2.length > 0) {
                    roomRefCmds.push(...roomRefCmds2);
                }
            }
        }
    });
}
function getRoomName(roomArchi, diff) {
    for (const infoObj of diff.diffInfo) {
        if (infoObj.label === 'name')
            return infoObj.archiValue;
    }
    const name = (0, getNodeInfoArchiAttr_1.getNodeInfoArchiAttr)(roomArchi.properties, 'name');
    const number = (0, getNodeInfoArchiAttr_1.getNodeInfoArchiAttr)(roomArchi.properties, 'number');
    return number ? `${number}-${name}` : name;
}
function getRoomNameAndAttr(roomArchi, diff) {
    const name = getRoomName(roomArchi, diff);
    const info = {};
    for (const diffInfo of diff.diffInfo) {
        info[diffInfo.label] = diffInfo.archiValue;
    }
    const attr = diff.diffAttr.map((itm) => {
        return {
            label: itm.label,
            value: itm.archiValue,
            unit: (0, transformArchi_1.parseUnit)(itm.unit),
        };
    });
    return { name, attr, info };
}
function getFloorRefCmd(floorData, floorNode, bimFileId) {
    const floorRefCmd = [];
    for (const strucNodeInfo of floorData.diff.diffRef.newBimObj) {
        let name = '';
        strucNodeInfo.properties.forEach((itm) => {
            if (itm.name === 'name')
                name = itm.value;
        });
        floorRefCmd.push({
            pNId: floorNode.info.id.get(),
            id: (0, guid_1.guid)(),
            type: 'floorRef',
            name,
            info: {
                dbid: strucNodeInfo.dbId,
                externalId: strucNodeInfo.externalId,
                bimFileId,
            },
        });
    }
    return floorRefCmd;
}
function getFloorName(floorData) {
    for (const infoObj of floorData.diff.diffInfo.diffInfo) {
        if (infoObj.label === 'name')
            return infoObj.archiValue;
    }
    return (0, getNodeInfoArchiAttr_1.getNodeInfoArchiAttr)(floorData.floorArchi.properties, 'name');
}
function getFloorCmdUp(floorData, buildingNode, floorNode) {
    var _a;
    const info = {};
    for (const diffInfo of floorData.diff.diffInfo.diffInfo) {
        info[diffInfo.label] = diffInfo.archiValue;
    }
    const name = getFloorName(floorData);
    const attr = floorData.diff.diffInfo.diffAttr.map((itm) => {
        return {
            label: itm.label,
            value: itm.archiValue,
            unit: (0, transformArchi_1.parseUnit)(itm.unit),
        };
    });
    const floorCmd = {
        type: 'floor',
        pNId: buildingNode.info.id.get(),
        id: (_a = floorNode === null || floorNode === void 0 ? void 0 : floorNode.info.id) === null || _a === void 0 ? void 0 : _a.get(),
        name,
        info,
        attr,
    };
    if (name === '') {
        Object.assign(floorCmd, { name });
    }
    return floorCmd;
}
//# sourceMappingURL=handleFloorUpdate.js.map