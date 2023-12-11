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
exports.getRoomCmd = void 0;
const transformArchi_1 = require("../../scripts/transformArchi");
const guid_1 = require("../../utils/guid");
const getRefCmd_1 = require("./getRefCmd");
const Constant_1 = require("../../../Constant");
function getRoomCmd(roomArchi, pNId, bimFileId, roomCmds, roomRefCmds, refContext, contextId) {
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
            contextId,
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
            const roomRefCmd = (0, getRefCmd_1.getRefCmd)(nodeInfo, roomCmd.id, 'roomRef', bimFileId);
            roomRefCmds.push(roomRefCmd);
        });
    });
}
exports.getRoomCmd = getRoomCmd;
function getRoomFromRefByName(refContext, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const children = yield refContext.getChildren(Constant_1.GEO_ROOM_RELATION);
        for (const child of children) {
            if (child.info.name.get() === name)
                return child;
        }
    });
}
//# sourceMappingURL=getRoomCmd.js.map