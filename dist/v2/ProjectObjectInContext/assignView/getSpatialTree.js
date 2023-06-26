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
exports.pushToAggregateSetDbidByBimFileId = exports.getSpatialTree = void 0;
const Constant_1 = require("../../../Constant");
const utils_1 = require("../../utils");
function getSpatialTree() {
    return __awaiter(this, void 0, void 0, function* () {
        const graph = (0, utils_1.getGraph)();
        const spatialContext = yield (0, utils_1.getContextSpatial)(graph);
        const buildings = yield spatialContext.getChildrenInContext(spatialContext);
        const proms = buildings.map((building) => __awaiter(this, void 0, void 0, function* () {
            const floors = yield building.getChildrenInContext(spatialContext);
            const buildingChildren = floors.map((floor) => __awaiter(this, void 0, void 0, function* () {
                const rooms = yield floor.getChildrenInContext(spatialContext);
                const roomDatas = rooms.map((room) => __awaiter(this, void 0, void 0, function* () {
                    (0, utils_1.addNodeGraphService)(room);
                    // to preload roomrefs
                    room.getChildren(Constant_1.GEO_REFERENCE_ROOM_RELATION);
                    // const roomRefs = await room.getChildren(GEO_REFERENCE_ROOM_RELATION);
                    // const aggrData = [];
                    // for (const roomRef of roomRefs) {
                    //   pushToAggregateSetDbidByBimFileId(
                    //     aggrData,
                    //     roomRef.info.dbid.get(),
                    //     roomRef.info.bimFileId.get()
                    //   );
                    // }
                    return {
                        type: 'room',
                        id: room.info.id.get(),
                        name: room.info.name.get(),
                        server_id: room._server_id,
                        children: [],
                        // data: aggrData,
                    };
                }));
                return {
                    type: 'floor',
                    id: floor.info.id.get(),
                    name: floor.info.name.get(),
                    server_id: floor._server_id,
                    children: yield Promise.all(roomDatas),
                };
            }));
            return {
                type: 'building',
                id: building.info.id.get(),
                name: building.info.name.get(),
                server_id: building._server_id,
                children: yield Promise.all(buildingChildren),
            };
        }));
        return Promise.all(proms);
    });
}
exports.getSpatialTree = getSpatialTree;
function pushToAggregateSetDbidByBimFileId(targetArray, id, bimFileId) {
    if (id === -1)
        return;
    for (const obj of targetArray) {
        if (obj.bimFileId === bimFileId) {
            obj.dbId.add(id);
            return;
        }
    }
    const idSet = new Set();
    idSet.add(id);
    targetArray.push({
        bimFileId,
        dbId: idSet,
    });
}
exports.pushToAggregateSetDbidByBimFileId = pushToAggregateSetDbidByBimFileId;
//# sourceMappingURL=getSpatialTree.js.map