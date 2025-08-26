"use strict";
/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
exports.createCmdFloorOnlyImport = createCmdFloorOnlyImport;
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const utils_1 = require("../utils");
const scripts_1 = require("../scripts");
function createCmdFloorOnlyImport(bimGeoContext, floorOnlyItems, bimFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const floorDataRes = [];
        const structDataRes = [];
        const removeStructDataRes = [];
        const res = [floorDataRes, structDataRes, removeStructDataRes];
        const floorsNodeData = yield loadFloorDataWithChildren(bimGeoContext);
        for (const floorData of floorOnlyItems) {
            const matchingNodeData = floorsNodeData.find((floorNodeData) => floorNodeData.externalId === floorData.externalId);
            if (((_a = floorData.children) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                const floorId = createFloorDataEntry(floorData, floorDataRes, bimGeoContext.info.id.get(), bimFileId, matchingNodeData === null || matchingNodeData === void 0 ? void 0 : matchingNodeData.id);
                for (const structData of floorData.children) {
                    const matchingStructData = matchingNodeData === null || matchingNodeData === void 0 ? void 0 : matchingNodeData.children.find((child) => child.externalId === structData.externalId);
                    createStructDataEntry(structData, structDataRes, bimGeoContext.info.id.get(), floorId, bimFileId, matchingStructData === null || matchingStructData === void 0 ? void 0 : matchingStructData.id);
                }
                // set to delete the other structures
                if (matchingNodeData === null || matchingNodeData === void 0 ? void 0 : matchingNodeData.children) {
                    const toRm = [];
                    for (const structData of matchingNodeData.children) {
                        if (!floorData.children.find((child) => child.externalId === structData.externalId)) {
                            toRm.push(structData.id);
                        }
                    }
                    if (toRm.length > 0) {
                        removeStructDataRes.push({
                            pNId: matchingNodeData.id,
                            type: 'floorRefDel',
                            nIdToDel: toRm,
                        });
                    }
                }
            }
        }
        return res;
    });
}
function createStructDataEntry(structData, structDataRes, contextId, floorId, bimFileId, nodeId) {
    var _a, _b;
    const name = (_b = (_a = structData.properties.find((itm) => itm.name === 'name')) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
    structDataRes.push({
        pNId: floorId,
        contextId,
        id: nodeId ? nodeId : (0, utils_1.guid)(),
        name,
        type: 'floorRef',
        info: {
            dbid: structData.dbId,
            externalId: structData.externalId,
            bimFileId,
        },
    });
}
function createFloorDataEntry(floorData, floorDataRes, contextId, bimFileId, nodeId) {
    let name = '';
    const attr = floorData.properties.map((itm) => {
        if (itm.name === 'name')
            name = itm.value;
        return {
            label: itm.name,
            value: itm.value,
            unit: (0, scripts_1.parseUnit)(itm.dataTypeContext),
        };
    });
    const id = nodeId ? nodeId : (0, utils_1.guid)();
    floorDataRes.push({
        pNId: contextId,
        contextId,
        id,
        name,
        type: 'floor',
        info: {
            dbid: floorData.dbId,
            externalId: floorData.externalId,
            bimFileId,
        },
        attr,
    });
    return id;
}
function loadFloorDataWithChildren(bimGeoContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const floorNodes = yield bimGeoContext.getChildrenInContext(bimGeoContext);
        const floorsNodeData = [];
        for (const node of floorNodes) {
            const children = yield node.getChildren('hasReferenceObject');
            const childrenData = children.map((child) => {
                return {
                    id: child.info.id.get(),
                    externalId: child.info.externalId.get(),
                    dbId: child.info.dbid.get(),
                    name: child.info.name.get(),
                };
            });
            const floorData = {
                id: node.info.id.get(),
                externalId: node.info.externalId.get(),
                dbId: node.info.dbid.get(),
                name: node.info.name.get(),
                properties: yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getAttrBySchema(node, {
                    Spatial: ['name', 'category', 'elevation'],
                }),
                children: childrenData,
            };
            floorsNodeData.push(floorData);
        }
        return floorsNodeData;
    });
}
//# sourceMappingURL=createCmdFloorOnlyImport.js.map