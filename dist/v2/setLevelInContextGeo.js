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
exports.setLevelInContextGeo = void 0;
const getContextSpatial_1 = require("./getContextSpatial");
const Constant_1 = require("../Constant");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
function setLevelAttr(spinalNode, value) {
    return __awaiter(this, void 0, void 0, function* () {
        const categoryNodeSpatial = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getCategoryByName(spinalNode, 'Spatial');
        const attrs = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getAttributesByCategory(spinalNode, categoryNodeSpatial);
        for (const attr of attrs) {
            if (attr.label.get() === 'level') {
                if (attr.value instanceof spinal_core_connectorjs_type_1.Val) {
                    attr.mod_attr('value', value);
                }
                else
                    attr.value.set(value);
                return;
            }
        }
        spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategory(spinalNode, categoryNodeSpatial, 'level', value);
    });
}
function setLevelInContextGeo(graph) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield (0, getContextSpatial_1.getContextSpatial)(graph);
        const buildings = yield context.getChildrenInContext(context);
        for (const building of buildings) {
            const floors = yield building.getChildrenInContext(context);
            for (const floor of floors) {
                const [floorRefObjs, rooms] = yield Promise.all([
                    floor.getChildren(Constant_1.GEO_REFERENCE_RELATION),
                    floor.getChildrenInContext(context),
                ]);
                const floorName = floor.info.name.get();
                const proms = [];
                for (const floorRefObj of floorRefObjs) {
                    proms.push(setLevelAttr(floorRefObj, floorName));
                }
                for (const room of rooms) {
                    proms.push(setLevelAttr(room, floorName));
                    const refsRoom = yield room.getChildren(Constant_1.GEO_REFERENCE_ROOM_RELATION);
                    for (const ref of refsRoom) {
                        proms.push(setLevelAttr(ref, floorName));
                    }
                }
                yield Promise.all(proms);
            }
        }
    });
}
exports.setLevelInContextGeo = setLevelInContextGeo;
//# sourceMappingURL=setLevelInContextGeo.js.map