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
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const consumeBatch_1 = require("../../utils/consumeBatch");
const getFragIds_1 = require("../utils/getFragIds");
const getWorldBoundingBox_1 = require("../utils/getWorldBoundingBox");
const utils_1 = require("../utils");
function setCenterPosInContextGeo(graph, cb) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const roomArrProm = [];
        roomNodes.forEach((roomNode) => {
            roomArrProm.push(() => updateRoomPos(roomNode));
        });
        yield (0, consumeBatch_1.consumeBatch)(roomArrProm, 20, (i, total) => cb(`1/3 room progress: ${i}/${total}`));
        const bimobjArrProm = [];
        const roomArrProm2 = roomNodes.map((roomNode) => () => updateBimObj(roomNode, context, bimobjArrProm));
        yield (0, consumeBatch_1.consumeBatch)(roomArrProm2, 20, (i, total) => cb(`2/3 load bimObj progress: ${i}/${total}`));
        yield (0, consumeBatch_1.consumeBatch)(bimobjArrProm, 20, (i, total) => cb(`3/3 bimObj update progress: ${i}/${total}`));
        cb(`done`);
    });
}
exports.setCenterPosInContextGeo = setCenterPosInContextGeo;
function updateRoomPos(roomNode) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomRefs = yield roomNode.getChildren(Constant_1.GEO_REFERENCE_ROOM_RELATION);
        let roomBbox = null;
        for (const roomRef of roomRefs) {
            if (roomRef.info.dbid.get() > 0) {
                // get autodesk Model
                const model = (0, utils_1.getModelByBimFileIdLoaded)(roomRef.info.bimFileId.get());
                if (!model) {
                    console.log(`${roomNode.info.name.get()}} skipped : model not loaded`);
                    continue;
                }
                const fragIds = yield (0, getFragIds_1.getFragIds)(roomRef.info.dbid.get(), model);
                const bbox = (0, getWorldBoundingBox_1.getWorldBoundingBox)(fragIds, model);
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
        const label = 'XYZ center';
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
        return spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategory(node, category, label, '0;0;0');
    });
}
function updateBimObj(roomNode, context, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const bimObjs = yield roomNode.getChildrenInContext(context);
        for (const bimObj of bimObjs) {
            res.push(() => __awaiter(this, void 0, void 0, function* () {
                const model = (0, utils_1.getModelByBimFileIdLoaded)(bimObj.info.bimFileId.get());
                if (!model) {
                    console.log(`${roomNode.info.name.get()}/${bimObj.info.name.get()} skipped : model not loaded`);
                    return;
                }
                const fragIds = yield (0, getFragIds_1.getFragIds)(bimObj.info.dbid.get(), model);
                const bbox = (0, getWorldBoundingBox_1.getWorldBoundingBox)(fragIds, model);
                const center = new THREE.Vector3();
                bbox.getCenter(center);
                const attr = yield getCenterPosAttr(bimObj);
                const str = `${center.x};${center.y};${center.z}`;
                attr.value.set(str);
            }));
        }
    });
}
//# sourceMappingURL=setCenterPosInContextGeo.js.map