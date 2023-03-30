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
const getContextSpatial_1 = require("./getContextSpatial");
const Constant_1 = require("../Constant");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
function getAreaAttr(spinalNode) {
    return __awaiter(this, void 0, void 0, function* () {
        const categoryNodeSpatial = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getCategoryByName(spinalNode, 'Spatial');
        const attrs = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getAttributesByCategory(spinalNode, categoryNodeSpatial);
        for (const attr of attrs) {
            if (attr.label.get() === 'area') {
                if (attr.value instanceof spinal_core_connectorjs_type_1.Val) {
                    attr.mod_attr('value', attr.value.get().toString());
                }
                return attr;
            }
        }
        return spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategory(spinalNode, categoryNodeSpatial, 'area', '0');
    });
}
function updateRoomArea(room) {
    return __awaiter(this, void 0, void 0, function* () {
        const proms = [];
        proms.push(getAreaAttr(room));
        const refsRoom = yield room.getChildren(Constant_1.GEO_REFERENCE_ROOM_RELATION);
        for (const ref of refsRoom) {
            proms.push(getAreaAttr(ref));
        }
        const [roomProp, ...refProp] = yield Promise.all(proms);
        const roomArea = refProp.reduce((acc, itm) => {
            return acc + parseFloat(itm.value.get());
        }, 0);
        roomProp.value.set(roomArea.toString());
        return roomProp;
    });
}
function updateFloorArea(floor, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const proms = [];
        proms.push(getAreaAttr(floor));
        const rooms = yield floor.getChildrenInContext(context);
        for (const room of rooms) {
            proms.push(updateRoomArea(room));
        }
        const [floorProp, ...roomProps] = yield Promise.all(proms);
        const floorArea = roomProps.reduce((acc, itm) => {
            return acc + parseFloat(itm.value.get());
        }, 0);
        floorProp.value.set(floorArea.toString());
        return floorProp;
    });
}
function setAreaInContextGeo(graph) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield (0, getContextSpatial_1.getContextSpatial)(graph);
        const buildings = yield context.getChildrenInContext(context);
        for (const building of buildings) {
            const proms = [];
            proms.push(getAreaAttr(building));
            const floors = yield building.getChildrenInContext(context);
            for (const floor of floors) {
                proms.push(updateFloorArea(floor, context));
            }
            const [buildingProp, ...floorProps] = yield Promise.all(proms);
            const buildingArea = floorProps.reduce((acc, itm) => {
                return acc + parseFloat(itm.value.get());
            }, 0);
            buildingProp.value.set(buildingArea.toString());
        }
    });
}
exports.setAreaInContextGeo = setAreaInContextGeo;
//# sourceMappingURL=setAreaInContextGeo.js.map