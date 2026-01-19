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
exports.initFloorAssign = initFloorAssign;
const getBimFileIdByModelId_1 = require("../../utils/projection/getBimFileIdByModelId");
const getOrCreateProjectionFloorConfig_1 = require("./getOrCreateProjectionFloorConfig");
const getBulkProperties_withOptions_1 = require("./getBulkProperties_withOptions");
const getProperties_1 = require("../../utils/projection/getProperties");
function initFloorAssign(lstItemsToAproximate, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const levelsFound = yield fetchUsedFloors(lstItemsToAproximate);
        // load floor form Spatial
        const floorNodes = yield getFloorNodesFromContext(context);
        const configFloorProjection = yield (0, getOrCreateProjectionFloorConfig_1.getOrCreateProjectionFloorConfig)(context);
        for (const floorNode of floorNodes) {
            let floorConfig = configFloorProjection.find((a) => a.floorId === floorNode._server_id);
            if (!floorConfig) {
                floorConfig = {
                    floorId: floorNode._server_id,
                    floorData: [],
                };
                configFloorProjection.push(floorConfig);
            }
            else {
                // remove the levelsFound that are already in config
                for (const item of floorConfig.floorData) {
                    const index = levelsFound.findIndex((f) => f.bimFileId === item.bimFileId && f.floorDbId === item.floorDbId);
                    if (index !== -1) {
                        levelsFound.splice(index, 1);
                    }
                }
            }
        }
        return { levelsFound, configFloorProjection };
    });
}
function getFloorNodesFromContext(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const floorNodes = [];
        const buildingNodes = yield context.getChildrenInContext(context);
        for (const buildingNode of buildingNodes) {
            const floorNodesInContext = yield buildingNode.getChildrenInContext(context);
            floorNodes.push(...floorNodesInContext);
        }
        return floorNodes;
    });
}
function fetchUsedFloors(lstItemsToAproximate) {
    return __awaiter(this, void 0, void 0, function* () {
        const levelsFounds = [];
        for (const items of lstItemsToAproximate) {
            for (const item of items) {
                const dbIds = item.dbId.map((d) => d.dbId);
                const bulkLevelData = yield (0, getBulkProperties_withOptions_1.getBulkProperties_withOptions)(item.model, dbIds, {
                    propFilter: ['Level'],
                    ignoreHidden: false,
                });
                for (const r of bulkLevelData) {
                    const levelProp = r.properties.find((p) => p.displayCategory === '__internalref__' &&
                        p.attributeName === 'Level');
                    if (levelProp) {
                        const data = item.dbId.find((d) => d.dbId === r.dbId);
                        if (data) {
                            data.levelDbId = levelProp.displayValue;
                        }
                        if (item.floors === undefined) {
                            item.floors = [];
                        }
                        if (!item.floors.find((f) => f.dbId === levelProp.displayValue)) {
                            const floorData = yield (0, getProperties_1.getProperties)(item.model, levelProp.displayValue);
                            item.floors.push({
                                name: floorData.name,
                                dbId: levelProp.displayValue,
                            });
                            // test if exist in levelsFounds
                            const bimFileId = (0, getBimFileIdByModelId_1.getBimFileIdByModelId)(item.model.id);
                            if (!levelsFounds.find((f) => f.bimFileId === bimFileId &&
                                f.floorDbId === levelProp.displayValue)) {
                                levelsFounds.push({
                                    bimFileId: bimFileId,
                                    floorDbId: levelProp.displayValue,
                                    name: floorData.name,
                                });
                            }
                        }
                    }
                }
            }
        }
        return levelsFounds;
    });
}
//# sourceMappingURL=initFloorAssign.js.map