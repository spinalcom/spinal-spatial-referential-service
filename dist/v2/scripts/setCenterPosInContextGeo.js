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
exports.setCenterPosInContextGeo = void 0;
const getContextSpatial_1 = require("../utils/getContextSpatial");
const Constant_1 = require("../../Constant");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const consumeBatch_1 = require("../../utils/consumeBatch");
const getFragIds_1 = require("../utils/getFragIds");
const getModelByBimFileId_1 = require("../utils/getModelByBimFileId");
const getWorldBoundingBox_1 = require("../utils/getWorldBoundingBox");
const updateLoadedModel_1 = require("../utils/updateLoadedModel");
function setCenterPosInContextGeo(graph) {
    return __awaiter(this, void 0, void 0, function* () {
        const loadedModel = new Map();
        (0, updateLoadedModel_1.updateLoadedModel)(loadedModel);
        const context = yield (0, getContextSpatial_1.getContextSpatial)(graph);
        const relationNames = [
            Constant_1.GEO_SITE_RELATION,
            Constant_1.GEO_BUILDING_RELATION,
            Constant_1.GEO_FLOOR_RELATION,
            Constant_1.GEO_ZONE_RELATION,
            Constant_1.GEO_ROOM_RELATION,
        ];
        const roomNodes = yield context.find(relationNames, (node) => {
            return node.info.type.get() === Constant_1.GEO_ROOM_TYPE;
        });
        const arrProm = [];
        roomNodes.forEach((roomNode) => {
            arrProm.push(() => updateRoomPos(roomNode, loadedModel));
        });
        yield (0, consumeBatch_1.consumeBatch)(arrProm, 20, console.log.bind(null, 'progress: %d/%d'));
    });
}
exports.setCenterPosInContextGeo = setCenterPosInContextGeo;
function updateRoomPos(roomNode, loadedModel) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomRefs = yield roomNode.getChildren(Constant_1.GEO_REFERENCE_ROOM_RELATION);
        let roomBbox = null;
        for (const roomRef of roomRefs) {
            if (roomRef.info.dbid.get() > 0) {
                // get autodesk Model
                const model = yield (0, getModelByBimFileId_1.getModelByBimFileId)(roomRef.info.bimFileId.get(), loadedModel);
                const fragIds = yield (0, getFragIds_1.getFragIds)(roomRef.info.dbid.get(), model);
                const bbox = (0, getWorldBoundingBox_1.getWorldBoundingBox)(fragIds, model);
                //  // add attributes to all roomRef ??
                // const center = bbox.center();
                // const attrFloor = await getCenterPosAttr(floorRef);
                // attrFloor.set(`${center.x};${center.y};${center.z}`);
                if (!roomBbox)
                    roomBbox = bbox;
                else
                    roomBbox.union(bbox);
            }
        }
        if (roomBbox) {
            const centerRoom = new THREE.Vector3();
            roomBbox.getCenter(centerRoom);
            const attr = yield getCenterPosAttr(roomNode);
            attr.value.set(`${centerRoom.x};${centerRoom.y};${centerRoom.z}`);
        }
    });
}
function getCenterPosAttr(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const categoryName = 'Spatial';
        const label = 'centerPos';
        let category = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getCategoryByName(node, categoryName);
        if (!category) {
            category = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.addCategoryAttribute(node, categoryName);
        }
        const attrs = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getAttributesByCategory(node, category);
        for (const attr of attrs) {
            if (attr.label.get() === label) {
                if (attr.value instanceof spinal_core_connectorjs_type_1.Val) {
                    attr.mod_attr('value', attr.value.get().toString());
                }
                return attr;
            }
        }
        return spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategory(node, category, label, '0;0;0');
    });
}
//# sourceMappingURL=setCenterPosInContextGeo.js.map