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
exports.mergeManualAssignArchiFloor = mergeManualAssignArchiFloor;
const floorArchiHasChildren_1 = require("./floorArchiHasChildren");
const getFloorFromContext_1 = require("./getFloorFromContext");
function mergeManualAssignArchiFloor(archiData, manualAssingment, context, buildingServerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const mapFloor = new Map();
        const toCreate = [];
        for (const extId in archiData) {
            if (Object.prototype.hasOwnProperty.call(archiData, extId)) {
                const floorArchi = archiData[extId];
                if ((0, floorArchiHasChildren_1.floorArchiHasChildren)(floorArchi)) {
                    const floorNode = yield (0, getFloorFromContext_1.getFloorFromContext)(context, floorArchi, manualAssingment, buildingServerId);
                    if (floorNode)
                        pushToMapArray(mapFloor, floorNode, floorArchi);
                    else {
                        toCreate.push(floorArchi);
                    }
                }
            }
        }
        const toCreateFromMap = [];
        for (const [, floorArchiArr] of mapFloor) {
            if (floorArchiArr.length <= 1) {
                toCreateFromMap.push(...floorArchiArr);
                continue;
            }
            let mergedFloor = undefined;
            for (let idx = 0; idx < floorArchiArr.length; idx++) {
                const floorArchi = floorArchiArr[idx];
                mergedFloor = mergeFloorArchi(floorArchi, mergedFloor);
            }
        }
        return toCreateFromMap.concat(...toCreate);
    });
}
function pushToMapArray(map, node, floorArchi) {
    let arr = map.get(node);
    if (!arr) {
        arr = [];
        map.set(node, arr);
    }
    arr.push(floorArchi);
}
function mergeFloorArchi(from, to) {
    const properties = {
        dbId: from.properties.dbId,
        externalId: from.properties.externalId,
        spinalnodeServerId: from.properties.spinalnodeServerId,
        properties: from.properties.properties,
    };
    if (!to) {
        const children = {};
        const structures = {};
        to = {
            properties,
            children,
            structures,
            propertiesArr: [],
        };
    }
    else {
        to.merged = (to.merged || 0) + 1;
        to.propertiesArr.push(properties);
    }
    for (const ext in from.children) {
        if (Object.prototype.hasOwnProperty.call(from.children, ext)) {
            to.children[ext] = from.children[ext];
        }
    }
    for (const ext in from.structures) {
        if (Object.prototype.hasOwnProperty.call(from.structures, ext)) {
            to.structures[ext] = from.structures[ext];
        }
    }
    return to;
}
//# sourceMappingURL=mergeManualAssignArchiFloor.js.map