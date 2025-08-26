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
exports.addViewerSelection = addViewerSelection;
const getBulkProperties_1 = require("../../utils/projection/getBulkProperties");
const isProjectionGroup_1 = require("../../utils/projection/isProjectionGroup");
function addViewerSelection(index, list, viewer) {
    return __awaiter(this, void 0, void 0, function* () {
        const prom = [];
        const toDel = [];
        const aggregateSelection = viewer.getAggregateSelection();
        const aggrProps = [];
        for (const select of aggregateSelection) {
            const props = yield (0, getBulkProperties_1.getBulkProperties)(select.model, select.selection);
            aggrProps.push(...props);
        }
        for (let idx = 0; idx < list.length; idx++) {
            const item = list[idx];
            if ((0, isProjectionGroup_1.isProjectionGroup)(item)) {
                if (idx === index) {
                    prom.push(item.getAndMergeSelection(viewer));
                }
                else {
                    for (const prop of aggrProps) {
                        prom.push(item.deleteItem(prop));
                    }
                }
            }
            else {
                for (const select of aggregateSelection) {
                    for (const dbId of select.selection) {
                        if (select.model.id === item.modelId && dbId === item.dbId) {
                            toDel.push(item);
                        }
                    }
                }
            }
        }
        for (const del of toDel) {
            const idx = list.findIndex((itm) => itm.uid === del.uid);
            if (idx !== -1) {
                list.splice(idx, 1);
            }
        }
        yield Promise.all(prom);
    });
}
//# sourceMappingURL=addViewerSelection.js.map