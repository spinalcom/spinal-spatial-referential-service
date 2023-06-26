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
exports.mergeRoomRef = void 0;
const getRoomRef_1 = require("./getRoomRef");
function mergeRoomRef(data) {
    const result = [];
    for (const floorName in data) {
        if (Object.prototype.hasOwnProperty.call(data, floorName)) {
            const arrAgre = data[floorName];
            arrAgre.forEach((agre) => {
                agre.dbId.forEach((dbid) => {
                    (0, getRoomRef_1.pushToAggregateSetDbidByModel)(result, dbid, agre.model);
                });
            });
        }
    }
    return result;
}
exports.mergeRoomRef = mergeRoomRef;
//# sourceMappingURL=mergeRoomRef.js.map