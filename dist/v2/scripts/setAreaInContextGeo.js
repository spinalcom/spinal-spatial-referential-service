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
exports.setAreaInContextGeo = void 0;
const getContextSpatial_1 = require("../utils/getContextSpatial");
const Constant_1 = require("../../Constant");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const updateLoadedModel_1 = require("../utils/archi/updateLoadedModel");
const getModelByBimFileId_1 = require("../utils/getModelByBimFileId");
const getADModelProps_1 = require("../utils/archi/getADModelProps");
const getADPropBylabel_1 = require("../utils/archi/getADPropBylabel");
function getAreaAttr(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const categoryName = 'Spatial';
        const label = 'area';
        let category = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getCategoryByName(node, categoryName);
        if (!category) {
            category = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.addCategoryAttribute(node, categoryName);
        }
        const attrs = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getAttributesByCategory(node, category);
        for (const attr of attrs) {
            if (attr.label.get() === label) {
                if (attr.value instanceof spinal_core_connectorjs_1.Val) {
                    attr.mod_attr('value', attr.value.get().toString());
                }
                return attr;
            }
        }
        return spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategory(node, category, label, '0');
    });
}
function updateRoomArea(room, loadedModel) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomProp = yield getAreaAttr(room);
        const refsRoom = yield room.getChildren(Constant_1.GEO_REFERENCE_ROOM_RELATION);
        const proms = [];
        for (const refRoom of refsRoom) {
            proms.push(getADAreaProp(refRoom, loadedModel));
        }
        const refsArea = yield Promise.all(proms);
        const roomArea = refsArea.reduce((acc, itm) => {
            return acc + parseFloat(itm);
        }, 0);
        roomProp.value.set(roomArea.toFixed(2));
        return roomProp;
    });
}
function getADAreaProp(refRoom, loadedModel) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dbid = (_a = refRoom.info.dbid) === null || _a === void 0 ? void 0 : _a.get();
            if (dbid && dbid > 0) {
                const model = yield (0, getModelByBimFileId_1.getModelByBimFileId)(refRoom.info.bimFileId.get(), loadedModel);
                const refProps = yield (0, getADModelProps_1.getADModelProps)(model, dbid);
                const refADProp = (0, getADPropBylabel_1.getADPropBylabel)(refProps, 'Area');
                return (refADProp === null || refADProp === void 0 ? void 0 : refADProp.displayValue) || '0';
            }
            return '0';
        }
        catch (error) {
            return '0';
        }
    });
}
function updateFloorArea(floor, context, loadedModel) {
    return __awaiter(this, void 0, void 0, function* () {
        const proms = [];
        proms.push(getAreaAttr(floor));
        const rooms = yield floor.getChildrenInContext(context);
        for (const room of rooms) {
            proms.push(updateRoomArea(room, loadedModel));
        }
        const [floorProp, ...roomProps] = yield Promise.all(proms);
        const floorArea = roomProps.reduce((acc, itm) => {
            return acc + parseFloat(itm.value.get());
        }, 0);
        floorProp.value.set(floorArea.toFixed(2));
        return floorProp;
    });
}
function setAreaInContextGeo(graph) {
    return __awaiter(this, void 0, void 0, function* () {
        const loadedModel = new Map();
        (0, updateLoadedModel_1.updateLoadedModel)(loadedModel);
        const context = yield (0, getContextSpatial_1.getContextSpatial)(graph);
        const buildings = yield context.getChildrenInContext(context);
        for (const building of buildings) {
            const proms = [];
            proms.push(getAreaAttr(building));
            const floors = yield building.getChildrenInContext(context);
            for (const floor of floors) {
                proms.push(updateFloorArea(floor, context, loadedModel));
            }
            const [buildingProp, ...floorProps] = yield Promise.all(proms);
            const buildingArea = floorProps.reduce((acc, itm) => {
                return acc + parseFloat(itm.value.get());
            }, 0);
            buildingProp.value.set(buildingArea.toFixed(2));
        }
    });
}
exports.setAreaInContextGeo = setAreaInContextGeo;
//# sourceMappingURL=setAreaInContextGeo.js.map