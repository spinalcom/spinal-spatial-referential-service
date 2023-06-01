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
exports.getFloorPropForModel = void 0;
const getBulkProperties_1 = require("../../utils/projection/getBulkProperties");
const getAllModelLoaded_1 = require("../../utils/projection/getAllModelLoaded");
const getFloorsDbIdOfModel_1 = require("./getFloorsDbIdOfModel");
function getFloorPropForModel() {
    return __awaiter(this, void 0, void 0, function* () {
        const models = (0, getAllModelLoaded_1.getAllModelLoaded)();
        const res = {};
        for (const model of models) {
            const floorDbid = yield (0, getFloorsDbIdOfModel_1.getFloorsDbIdOfModel)(model);
            const floorProps = yield (0, getBulkProperties_1.getBulkProperties)(model, floorDbid, {
                propFilter: ['name', 'externalId'],
            });
            res[model.id] = floorProps.map((itm) => {
                return {
                    id: itm.id,
                    externalId: itm.externalId,
                    dbId: itm.dbId,
                    name: itm.name,
                    modelId: model.id,
                };
            });
        }
        return res;
    });
}
exports.getFloorPropForModel = getFloorPropForModel;
//# sourceMappingURL=getFloorPropForModel.js.map