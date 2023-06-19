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
exports.createCmdNotFound = void 0;
const getBulkProperties_1 = require("../../utils/projection/getBulkProperties");
const getDiffSelection_1 = require("./getDiffSelection");
const createCmdNotFoundItm_1 = require("./createCmdNotFoundItm");
function createCmdNotFound(intersectRes) {
    return __awaiter(this, void 0, void 0, function* () {
        const notFound = (0, getDiffSelection_1.getDiffSelection)(intersectRes);
        const auProps = yield getItemNames(notFound);
        const res = [];
        for (const auProp of auProps) {
            (0, createCmdNotFoundItm_1.createCmdNotFoundItm)(res, auProp);
        }
        return res;
    });
}
exports.createCmdNotFound = createCmdNotFound;
function getItemNames(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = [];
        for (const { model, dbIds } of data) {
            res.push((0, getBulkProperties_1.getBulkProperties)(model, dbIds, {
                propFilter: ['name', 'externalId', 'Category'],
            }));
        }
        return Promise.all(res).then((arr) => {
            const result = [];
            for (const itms of arr) {
                result.push(...itms);
            }
            return result;
        });
    });
}
//# sourceMappingURL=createCmdNotFound.js.map