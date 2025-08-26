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
exports.viewDataAssignInViewer = viewDataAssignInViewer;
exports.clearThemingColors = clearThemingColors;
const Constant_1 = require("../../../Constant");
const utils_1 = require("../../utils");
const getAllModelLoaded_1 = require("../../utils/projection/getAllModelLoaded");
const getRoomRef_1 = require("../projection/getRoomRef");
/**
 * obj = blue
 * roomSelect = yellow
 * if validId; valid = green & parent = red
 * else parent = green
 * @export
 * @param {number} dbid
 * @param {string} bimFileId
 * @param {string} [roomId]
 * @param {string} [parentValidId]
 * @param {string} [parentNodeId]
 */
function viewDataAssignInViewer(dbid, bimFileId, roomId, parentValidId, parentNodeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const models = (0, getAllModelLoaded_1.getAllModelLoaded)();
        const viewer = (0, utils_1.getViewer)();
        // clean model selection / isolation
        for (const model of models) {
            viewer.clearThemingColors(model);
        }
        const green = new THREE.Vector4(0, 227, 0);
        const red = new THREE.Vector4(255, 0, 0);
        const roomIdColor = new THREE.Vector4(227, 219, 0);
        const modelDbid = (0, utils_1.getModelByBimFileIdLoaded)(bimFileId);
        if (modelDbid) {
            viewer.clearSelection();
            viewer.select(dbid, modelDbid);
        }
        const aggrData = [
            {
                dbId: new Set([dbid]),
                model: modelDbid,
            },
        ];
        let colorValid, colorParent;
        if (parentValidId) {
            colorValid = green;
            colorParent = red;
        }
        else {
            colorValid = red;
            colorParent = green;
        }
        if (roomId)
            yield getRoomRefsInfo((0, utils_1.getRealNode)(roomId), aggrData, roomIdColor);
        if (parentNodeId)
            yield getRoomRefsInfo((0, utils_1.getRealNode)(parentNodeId), aggrData, colorParent);
        if (parentValidId)
            yield getRoomRefsInfo((0, utils_1.getRealNode)(parentValidId), aggrData, colorValid);
        const dataFit = aggrData.map((itm) => {
            return {
                model: itm.model,
                selection: Array.from(itm.dbId),
            };
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        viewer.fitToView(dataFit);
        const data = aggrData.map((itm) => {
            return {
                model: itm.model,
                ids: Array.from(itm.dbId),
            };
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        viewer.impl.visibilityManager.aggregateIsolate(data);
    });
}
function getRoomRefsInfo(roomNode, aggrData, color) {
    return __awaiter(this, void 0, void 0, function* () {
        const viewer = (0, utils_1.getViewer)();
        if (roomNode) {
            const roomRefs = yield roomNode.getChildren(Constant_1.GEO_REFERENCE_ROOM_RELATION);
            for (const roomRef of roomRefs) {
                const model = (0, utils_1.getModelByBimFileIdLoaded)(roomRef.info.bimFileId.get());
                if (model) {
                    const dbid = roomRef.info.dbid.get();
                    viewer.setThemingColor(dbid, color, model);
                    (0, getRoomRef_1.pushToAggregateSetDbidByModel)(aggrData, dbid, model);
                }
            }
        }
    });
}
function clearThemingColors() {
    const models = (0, getAllModelLoaded_1.getAllModelLoaded)();
    const viewer = (0, utils_1.getViewer)();
    for (const model of models) {
        viewer.clearThemingColors(model);
    }
}
//# sourceMappingURL=viewDataAssignInViewer.js.map