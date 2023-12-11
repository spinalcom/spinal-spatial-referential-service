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
exports.updateBimObjectFromBimFileId = void 0;
const Constant_1 = require("../../Constant");
const getBimContextByBimFileId_1 = require("../utils/getBimContextByBimFileId");
const getExternalIdMapping_1 = require("../utils/getExternalIdMapping");
function updateBimObjectFromBimFileId(bimFileId, model, updateBimobjectsName, updateBimobjectsDbid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!updateBimobjectsName && !updateBimobjectsDbid)
            return;
        const bimContext = yield (0, getBimContextByBimFileId_1.getBimContextByBimFileId)(bimFileId);
        if (typeof bimContext === 'undefined')
            throw new Error('No BimOject found with this bimFileId');
        const map = yield (0, getExternalIdMapping_1.getExternalIdMapping)(model);
        const bimobjs = yield bimContext.getChildren(Constant_1.GEO_EQUIPMENT_RELATION);
        for (const bimobj of bimobjs) {
            if (bimobj.info.bimFileId.get() === bimFileId) {
                const dbid = map[bimobj.info.externalId.get()];
                if (updateBimobjectsDbid) {
                    if (dbid)
                        bimobj.info.dbid.set(dbid);
                    else {
                        bimobj.info.dbid.set(-1);
                    }
                }
                else if (updateBimobjectsName && dbid) {
                    model.getProperties(dbid, (prop) => {
                        if (prop.name) {
                            bimobj.info.name.set(prop.name);
                        }
                    });
                }
            }
        }
    });
}
exports.updateBimObjectFromBimFileId = updateBimObjectFromBimFileId;
//# sourceMappingURL=updateBimObjectFromBimFileId.js.map