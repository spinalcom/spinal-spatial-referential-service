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
exports.createCmdProjectionForManualAssing = void 0;
const utils_1 = require("../../utils");
const getProperties_1 = require("../../utils/projection/getProperties");
const createCmdNotFoundItm_1 = require("./createCmdNotFoundItm");
const createCmdProjItm_1 = require("./createCmdProjItm");
const getCenterPos_1 = require("./getCenterPos");
function createCmdProjectionForManualAssing(warnArr, errorArr) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = [];
        const resMiss = [];
        for (const warn of warnArr) {
            const bimObjectDbId = warn.dbid;
            const bimObjectModel = (0, utils_1.getModelByBimFileIdLoaded)(warn.bimFileId);
            const auProp = yield (0, getProperties_1.getProperties)(bimObjectModel, bimObjectDbId);
            const centerPos = yield (0, getCenterPos_1.getCenterPos)(auProp);
            if (warn.validId) {
                (0, createCmdProjItm_1.createCmdProjItm)(res, auProp, warn.validId, centerPos, false);
            }
            else {
                (0, createCmdProjItm_1.createCmdProjItm)(res, auProp, warn.PNId, centerPos, true);
            }
        }
        for (const warn of errorArr) {
            const bimObjectDbId = warn.dbid;
            const bimObjectModel = (0, utils_1.getModelByBimFileIdLoaded)(warn.bimFileId);
            const auProp = yield (0, getProperties_1.getProperties)(bimObjectModel, bimObjectDbId);
            const centerPos = yield (0, getCenterPos_1.getCenterPos)(auProp);
            if (warn.validId) {
                (0, createCmdProjItm_1.createCmdProjItm)(res, auProp, warn.validId, centerPos, false);
            }
            else {
                (0, createCmdNotFoundItm_1.createCmdNotFoundItm)(resMiss, auProp, centerPos);
            }
        }
        return { cmd: res, cmdMiss: resMiss };
    });
}
exports.createCmdProjectionForManualAssing = createCmdProjectionForManualAssing;
//# sourceMappingURL=createCmdProjectionForManualAssing.js.map