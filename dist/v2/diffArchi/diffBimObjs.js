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
exports.diffBimObjs = diffBimObjs;
const IGetArchi_1 = require("../interfaces/IGetArchi");
const getNodeFromGeo_1 = require("./getNodeFromGeo");
const findNodeArchiWithSpinalNode_1 = require("./findNodeArchiWithSpinalNode");
function diffBimObjs(bimObjInfos, bimObjNodes, manualAssingment) {
    return __awaiter(this, void 0, void 0, function* () {
        const newBimObj = [];
        const delBimObj = [];
        for (const bimObjInfo of bimObjInfos) {
            const node = yield (0, getNodeFromGeo_1.getNodeFromGeo)(bimObjNodes, bimObjInfo, manualAssingment);
            if (!node) {
                // not found
                newBimObj.push(bimObjInfo);
                bimObjInfo.modificationType = IGetArchi_1.EModificationType.create;
                continue;
            }
        }
        for (const bimObjNode of bimObjNodes) {
            const nodeArchi = yield (0, findNodeArchiWithSpinalNode_1.findNodeArchiWithSpinalNode)(bimObjNode, bimObjInfos, manualAssingment);
            if (nodeArchi === undefined)
                delBimObj.push(bimObjNode._server_id);
        }
        return { newBimObj, delBimObj };
    });
}
//# sourceMappingURL=diffBimObjs.js.map