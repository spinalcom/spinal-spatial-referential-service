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
exports.findNodeArchiWithSpinalNode = void 0;
const getNodeInfoArchiAttr_1 = require("../utils/archi/getNodeInfoArchiAttr");
const getOrLoadModel_1 = require("../utils/getOrLoadModel");
function findNodeArchiWithSpinalNode(node, nodeInfosArchi, manualAssingment) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // check ManualAssingment retrun it if found;
        for (const [extId, serverId] of manualAssingment) {
            if ((yield (0, getOrLoadModel_1.getOrLoadModel)(serverId)) === node) {
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
    });
}
exports.findNodeArchiWithSpinalNode = findNodeArchiWithSpinalNode;
//# sourceMappingURL=findNodeArchiWithSpinalNode.js.map