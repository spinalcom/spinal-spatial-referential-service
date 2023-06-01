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
exports.getRefFloorZMinMax = void 0;
const getFragIds_1 = require("../../utils/getFragIds");
const getWorldBoundingBox_1 = require("../../utils/getWorldBoundingBox");
function getRefFloorZMinMax(data) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const record = {};
        for (const id in data) {
            const promise = [];
            let min = null;
            for (const { dbId: dbids, model } of data[id]) {
                for (const dbid of dbids) {
                    promise.push(getMinZ(dbid, model));
                }
            }
            const p = yield Promise.all(promise);
            for (const z of p) {
                if (min === null || z < min)
                    min = z;
            }
            const res = { min, max: null, floorId: id, distance: null };
            record[id] = res;
        }
        const tmp = [];
        for (const floorName in record) {
            tmp.push(record[floorName]);
        }
        tmp.sort((a, b) => {
            return a.min - b.min;
        });
        for (let idx = 0; idx < tmp.length; idx++) {
            const itm = tmp[idx];
            itm.max = ((_a = tmp[idx + 1]) === null || _a === void 0 ? void 0 : _a.min) || null;
            if (itm.max !== null) {
                tmp[idx].distance = itm.max - itm.min;
            }
        }
        console.log('getRefFloorZMinMax 2 ', tmp);
        const result = {};
        for (const itm of tmp) {
            result[itm.floorId] = itm;
        }
        console.log('getRefFloorZMinMax 3 ', result);
        return result;
    });
}
exports.getRefFloorZMinMax = getRefFloorZMinMax;
function getMinZ(dbid, model) {
    return __awaiter(this, void 0, void 0, function* () {
        const fragIds = yield (0, getFragIds_1.getFragIds)(dbid, model);
        const bbox = (0, getWorldBoundingBox_1.getWorldBoundingBox)(fragIds, model);
        return bbox.min.z;
    });
}
//# sourceMappingURL=getRefFloorZMinMax.js.map