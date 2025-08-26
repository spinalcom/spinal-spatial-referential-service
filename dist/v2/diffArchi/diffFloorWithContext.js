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
exports.diffFloorWithContext = diffFloorWithContext;
const IGetArchi_1 = require("../interfaces/IGetArchi");
const getFloorFromContext_1 = require("./getFloorFromContext");
const getDiffRefFloor_1 = require("./getDiffRefFloor");
const diffRoomChildren_1 = require("./diffRoomChildren");
const diffInfoAttr_1 = require("./diffInfoAttr");
function diffFloorWithContext(floorArchi, context, manualAssingment, buildingServerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const floorNode = yield (0, getFloorFromContext_1.getFloorFromContext)(context, floorArchi, manualAssingment, buildingServerId);
        if (!floorNode) {
            // floor not found
            floorArchi.properties.modificationType = IGetArchi_1.EModificationType.create;
            return undefined;
        }
        // archi exist in context
        const [diffInfo, diffRoom, diffRef] = yield Promise.all([
            // -> diff archi info
            (0, diffInfoAttr_1.diffInfoAttr)(floorArchi.properties, floorNode),
            // -> diff archi children
            (0, diffRoomChildren_1.diffRoomChildren)(floorNode, context, floorArchi, manualAssingment),
            // diff structures
            (0, getDiffRefFloor_1.getDiffRefFloor)(floorNode, floorArchi, manualAssingment),
        ]);
        return {
            diffInfo,
            diffRoom,
            diffRef,
        };
    });
}
//# sourceMappingURL=diffFloorWithContext.js.map