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
exports.getModelByBimFileId = void 0;
const loadModelByBimFileId_1 = require("./loadModelByBimFileId");
function getModelByBimFileId(bimFileId, loadedModel) {
    if (loadedModel.has(bimFileId))
        return loadedModel.get(bimFileId);
    const prom = (0, loadModelByBimFileId_1.loadModelByBimFileId)(bimFileId);
    loadedModel.set(bimFileId, prom);
    return prom;
}
exports.getModelByBimFileId = getModelByBimFileId;
//# sourceMappingURL=getModelByBimFileId.js.map