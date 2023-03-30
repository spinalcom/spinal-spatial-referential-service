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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNodeArchiWithSpinalNode = void 0;
const getNodeInfoArchiAttr_1 = require("../utils/getNodeInfoArchiAttr");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
function findNodeArchiWithSpinalNode(node, nodeInfosArchi, manualAssingment) {
    var _a, _b;
    // check ManualAssingment retrun it if found;
    for (const [extId, serverId] of manualAssingment) {
        if (spinal_core_connectorjs_type_1.FileSystem._objects[serverId] === node) {
            for (const nodeArchi of nodeInfosArchi) {
                if (nodeArchi.externalId === extId) {
                    return nodeArchi;
                }
            }
        }
    }
    // search via externalId
    for (const nodeArchi1 of nodeInfosArchi) {
        if (nodeArchi1.externalId === ((_a = node.info.externalId) === null || _a === void 0 ? void 0 : _a.get())) {
            return nodeArchi1;
        }
    }
    // search via name
    for (const nodeArchi2 of nodeInfosArchi) {
        const nodeArchiName = (0, getNodeInfoArchiAttr_1.getNodeInfoArchiAttr)(nodeArchi2, 'name');
        if (nodeArchiName === ((_b = node.info.name) === null || _b === void 0 ? void 0 : _b.get())) {
            return nodeArchi2;
        }
    }
}
exports.findNodeArchiWithSpinalNode = findNodeArchiWithSpinalNode;
//# sourceMappingURL=findNodeArchiWithSpinalNode.js.map