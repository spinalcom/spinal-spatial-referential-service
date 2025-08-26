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
exports.getPropItemFromPropPath = getPropItemFromPropPath;
const getBulkProperties_1 = require("./getBulkProperties");
const getDbIdChildren_1 = require("./getDbIdChildren");
function getPropItemFromPropPath(propPath, model) {
    return __awaiter(this, void 0, void 0, function* () {
        const tree = model.getInstanceTree();
        let currDbId = tree.nodeAccess.rootId;
        let lastFound;
        for (const nameProp of propPath) {
            const childrenDbId = (0, getDbIdChildren_1.getDbIdChildren)(tree, currDbId);
            const childrenProps = yield (0, getBulkProperties_1.getBulkProperties)(model, childrenDbId);
            lastFound = childrenProps.find((itm) => itm.name === nameProp);
            if (!lastFound)
                return undefined;
            currDbId = lastFound.dbId;
        }
        return lastFound ? lastFound : undefined;
    });
}
//# sourceMappingURL=getPropItemFromPropPath.js.map