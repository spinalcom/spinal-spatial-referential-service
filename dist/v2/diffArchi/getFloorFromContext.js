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
exports.getFloorFromContext = void 0;
const getNodeInfoArchiAttr_1 = require("../utils/getNodeInfoArchiAttr");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
function getFloorFromContext(contextGeo, buildingServId, floorArchi, manualAssingment) {
    return __awaiter(this, void 0, void 0, function* () {
        // check ManualAssingment retrun it if found;
        const serverId = manualAssingment.get(floorArchi.properties.externalId);
        if (serverId)
            return spinal_core_connectorjs_type_1.FileSystem._objects[serverId];
        // not in manualAssing; get building floors
        const buildings = yield contextGeo.getChildrenInContext(contextGeo);
        const buildingsFloors = yield Promise.all(buildings.map((building) => {
            if (building._server_id === buildingServId)
                return building.getChildrenInContext(contextGeo);
        }));
        // search via externalId
        for (const buildingFloors of buildingsFloors) {
            if (buildingFloors)
                for (const floorNode of buildingFloors) {
                    if (floorNode.info.externalId.get() === floorArchi.properties.externalId)
                        return floorNode;
                }
        }
        // search via name
        const floorArchiName = ((0, getNodeInfoArchiAttr_1.getNodeInfoArchiAttr)(floorArchi.properties, 'name'));
        for (const buildingFloors of buildingsFloors) {
            if (buildingFloors)
                for (const floorNode of buildingFloors) {
                    if (floorNode.info.name.get() === floorArchiName)
                        return floorNode;
                }
        }
    });
}
exports.getFloorFromContext = getFloorFromContext;
//# sourceMappingURL=getFloorFromContext.js.map