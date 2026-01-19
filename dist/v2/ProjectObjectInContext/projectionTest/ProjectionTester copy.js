"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectionTester = void 0;
const utils_1 = require("../../utils");
const colors_json_1 = __importDefault(require("./colors.json"));
class ProjectionTester {
    constructor(intersectRes) {
        this.pageSize = 25;
        this.viewer = (0, utils_1.getViewer)();
        // private floors: Map<number, IAggregateDbidByModelItem[]> = new Map();
        this.roomData = [];
        this.colors = colors_json_1.default.map((c) => new THREE.Vector4(c[0] / 255, c[1] / 255, c[2] / 255, 1));
        this.assignItemByRooms(intersectRes);
        this.nbPages = Math.ceil(this.roomData.length / colors_json_1.default.length);
    }
    /**
     * @param {number} pageIndex start at 0
     * @memberof ProjectionTester
     */
    colorRooms(pageIndex) {
        if (pageIndex > this.nbPages)
            pageIndex = this.nbPages;
        const models = (0, utils_1.getAllModelLoaded)();
        for (const model of models) {
            this.viewer.clearThemingColors(model);
        }
        const start = pageIndex * this.pageSize;
        const end = start + this.pageSize;
        const roomSlice = this.roomData.slice(start, end);
        const aggrData = [];
        for (let i = 0; i < roomSlice.length; i++) {
            const roomData = roomSlice[i];
            for (const data of roomData.data) {
                for (const dbid of data.dbId) {
                    data.model.setThemingColor(dbid, roomData.color);
                }
                pushToAggregateDbidByModel(aggrData, data.dbId, data.model);
            }
        }
        const dataview = aggrData.map((view) => {
            return { model: view.model, selection: view.dbId, ids: view.dbId };
        });
        // @ts-ignore
        this.viewer.fitToView(dataview);
        // @ts-ignore
        this.viewer.impl.visibilityManager.aggregateIsolate(dataview);
        this.viewer.impl.invalidate(true);
    }
    clearColors() {
        const models = (0, utils_1.getAllModelLoaded)();
        for (const model of models) {
            this.viewer.clearThemingColors(model);
        }
        this.viewer.impl.invalidate(true);
    }
    assignItemByRooms(intersectRes) {
        const rooms = new Map();
        for (const inter of intersectRes) {
            let room = rooms.get(inter.intersections.dbId);
            if (!room) {
                room = [];
                rooms.set(inter.intersections.dbId, room);
            }
            const model = (0, utils_1.getModelByModelId)(inter.intersections.modelId);
            pushToAggregateDbidByModel(room, [inter.intersections.dbId], model);
            const modelObj = (0, utils_1.getModelByModelId)(inter.origin.modelId);
            pushToAggregateDbidByModel(room, [inter.origin.dbId], modelObj);
        }
        this.roomData = [];
        let index = 0;
        for (const [roomId, data] of rooms) {
            this.roomData.push({
                color: this.colors[index % this.colors.length],
                data,
            });
            index++;
        }
    }
}
exports.ProjectionTester = ProjectionTester;
function pushToAggregateDbidByModel(targetArray, ids, model) {
    for (const obj of targetArray) {
        if (obj.model === model) {
            for (const id of ids) {
                const findItem = obj.dbId.find((a) => a === id);
                if (findItem === undefined) {
                    obj.dbId.push(id);
                }
            }
            return;
        }
    }
    const dbId = [];
    for (const id of ids) {
        dbId.push(id);
    }
    targetArray.push({
        model,
        dbId,
    });
}
//# sourceMappingURL=ProjectionTester%20copy.js.map