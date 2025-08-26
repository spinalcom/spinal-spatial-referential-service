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
exports.getFloorFromContext = getFloorFromContext;
const getNodeInfoArchiAttr_1 = require("../utils/archi/getNodeInfoArchiAttr");
const getOrLoadModel_1 = require("../utils/getOrLoadModel");
const Constant_1 = require("../../Constant");
function getFloorFromContext(context, floorArchi, manualAssingment, buildingServId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // check ManualAssingment retrun it if found;
        const serverId = manualAssingment.get(floorArchi.properties.externalId);
        if (serverId)
            return (0, getOrLoadModel_1.getOrLoadModel)(serverId);
        // not in manualAssing; get building floors
        const parentNode = buildingServId
            ? yield (0, getOrLoadModel_1.getOrLoadModel)(buildingServId)
            : context;
        const floorNodes = yield parentNode.find([
            Constant_1.GEO_SITE_RELATION,
            Constant_1.GEO_BUILDING_RELATION,
            Constant_1.GEO_FLOOR_RELATION,
            Constant_1.GEO_ZONE_RELATION,
        ], (node) => Constant_1.GEO_FLOOR_TYPE === node.info.type.get());
        // search via externalId
        for (const floorNode of floorNodes) {
            if (((_a = floorNode.info.externalId) === null || _a === void 0 ? void 0 : _a.get()) === floorArchi.properties.externalId)
                return floorNode;
        }
        // search via name
        const floorArchiName = ((0, getNodeInfoArchiAttr_1.getNodeInfoArchiAttr)(floorArchi.properties, 'name'));
        for (const floorNode of floorNodes) {
            if (floorNode.info.name.get() === floorArchiName)
                return floorNode;
        }
    });
}
//# sourceMappingURL=getFloorFromContext.js.map