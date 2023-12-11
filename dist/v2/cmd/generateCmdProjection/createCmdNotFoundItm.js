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
exports.createCmdNotFoundItm = void 0;
const getBimFileIdByModelId_1 = require("../../utils/projection/getBimFileIdByModelId");
const getCategory_1 = require("./getCategory");
function createCmdNotFoundItm(target, auProp, centerPos) {
    var _a;
    const revitCat = (_a = (0, getCategory_1.getCategory)(auProp)) === null || _a === void 0 ? void 0 : _a.displayValue;
    const bimFileId = (0, getBimFileIdByModelId_1.getBimFileIdByModelId)(auProp.modelId);
    const itm = target.find((it) => it.bimFileId === bimFileId);
    if (itm) {
        const tmp = itm.data.find((it) => it.dbid === auProp.dbId);
        if (!tmp) {
            itm.data.push({
                dbid: auProp.dbId,
                externalId: auProp.externalId,
                name: auProp.name,
                revitCat: revitCat,
                centerPos,
            });
        }
    }
    else {
        target.push({
            type: 'CmdMissing',
            bimFileId,
            data: [
                {
                    dbid: auProp.dbId,
                    externalId: auProp.externalId,
                    name: auProp.name,
                    revitCat: revitCat,
                    centerPos,
                },
            ],
        });
    }
}
exports.createCmdNotFoundItm = createCmdNotFoundItm;
//# sourceMappingURL=createCmdNotFoundItm.js.map