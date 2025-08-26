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
exports.handleFloorCmdNew = handleFloorCmdNew;
const transformArchi_1 = require("../../scripts/transformArchi");
const guid_1 = require("../../utils/guid");
const isInSkipList_1 = require("../../utils/archi/isInSkipList");
const getRefCmd_1 = require("./getRefCmd");
const getRoomCmd_1 = require("./getRoomCmd");
function handleFloorCmdNew(floorData, parentNodeId, bimFileId, skipList, refContext, contextId, floors, floorRefs, rooms, roomRefs) {
    return __awaiter(this, void 0, void 0, function* () {
        const floorCmd = getFloorCmdNew(floorData, parentNodeId, bimFileId, contextId);
        // floor ref structs
        getFloorRefCmdNew(floorData.floorArchi.structures, floorCmd.id, bimFileId, floorRefs);
        // rooms
        yield getFloorRoomsCmdNew(floorData, floorCmd, bimFileId, skipList, refContext, contextId, rooms, roomRefs);
        floors.push(floorCmd);
    });
}
function getFloorRoomsCmdNew(floorData, floorCmd, bimFileId, skipList, refContext, contextId, roomCmds, roomRefCmds) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const floorExtId in floorData.floorArchi.children) {
            if (Object.prototype.hasOwnProperty.call(floorData.floorArchi.children, floorExtId)) {
                const roomArchi = floorData.floorArchi.children[floorExtId];
                if ((0, isInSkipList_1.isInSkipList)(skipList, roomArchi.properties.externalId))
                    continue;
                yield (0, getRoomCmd_1.getRoomCmd)(roomArchi, floorCmd.id, bimFileId, roomCmds, roomRefCmds, refContext, contextId);
            }
        }
    });
}
function getFloorRefCmdNew(structures, floorId, bimFileId, floorRefs) {
    for (const RefExtId in structures) {
        if (Object.prototype.hasOwnProperty.call(structures, RefExtId)) {
            const { properties } = structures[RefExtId];
            const struct = (0, getRefCmd_1.getRefCmd)(properties, floorId, 'floorRef', bimFileId);
            floorRefs.push(struct);
        }
    }
}
function getFloorCmdNew(floorData, parentNodeId, bimFileId, contextId) {
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
        pNId: parentNodeId,
        contextId,
        id: (0, guid_1.guid)(),
        type: 'floor',
        name,
        info,
        attr,
    };
}
//# sourceMappingURL=handleFloorCmdNew.js.map