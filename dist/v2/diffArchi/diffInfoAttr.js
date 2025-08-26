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
exports.diffInfoAttr = diffInfoAttr;
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const IGetArchi_1 = require("../interfaces/IGetArchi");
const checkDiffObj_1 = require("./checkDiffObj");
const getNodeInfoArchiAttr_1 = require("../utils/archi/getNodeInfoArchiAttr");
function diffInfoAttr(nodeInfo, spinalNode) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        nodeInfo.spinalnodeServerId = spinalNode._server_id;
        nodeInfo.modificationType = 0;
        const diffInfo = [];
        // check dbId
        (0, checkDiffObj_1.checkDiffObj)(diffInfo, 'dbid', (_a = spinalNode.info.dbid) === null || _a === void 0 ? void 0 : _a.get(), nodeInfo.dbId);
        // check externalId
        (0, checkDiffObj_1.checkDiffObj)(diffInfo, 'externalId', (_b = spinalNode.info.externalId) === null || _b === void 0 ? void 0 : _b.get(), nodeInfo.externalId);
        // check name node
        const name = (0, getNodeInfoArchiAttr_1.getNodeInfoArchiAttr)(nodeInfo, 'name');
        const number = (0, getNodeInfoArchiAttr_1.getNodeInfoArchiAttr)(nodeInfo, 'number');
        (0, checkDiffObj_1.checkDiffObj)(diffInfo, 'name', spinalNode.info.name.get(), number ? `${number}-${name}` : name);
        // -> diff archi attr
        const categoryNodeSpatial = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getCategoryByName(spinalNode, 'Spatial');
        const attrs = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getAttributesByCategory(spinalNode, categoryNodeSpatial);
        const diffAttr = [];
        for (const archiProps of nodeInfo.properties) {
            if (archiProps.category === '__internalref__')
                continue; // if level skip (will be set later)
            let find = false;
            for (const attr of attrs) {
                if (archiProps.name === attr.label.get()) {
                    (0, checkDiffObj_1.checkDiffObj)(diffAttr, archiProps.name, attr.value.get(), archiProps.value, archiProps.dataTypeContext);
                    find = true;
                    break;
                }
            }
            if (find === false) {
                (0, checkDiffObj_1.checkDiffObj)(diffAttr, archiProps.name, undefined, archiProps.value, archiProps.dataTypeContext);
            }
        }
        if (diffInfo.length > 0) {
            nodeInfo.modificationType =
                nodeInfo.modificationType | IGetArchi_1.EModificationType.update;
            nodeInfo.modificationType =
                nodeInfo.modificationType | IGetArchi_1.EModificationType.updateNode;
        }
        if (diffAttr.length > 0) {
            nodeInfo.modificationType =
                nodeInfo.modificationType | IGetArchi_1.EModificationType.update;
            nodeInfo.modificationType =
                nodeInfo.modificationType | IGetArchi_1.EModificationType.updateAttr;
        }
        return {
            diffInfo,
            diffAttr,
        };
    });
}
//# sourceMappingURL=diffInfoAttr.js.map