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
exports.updateProjectionFloorConfig = updateProjectionFloorConfig;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
function updateProjectionFloorConfig(context, levelsFoundAssigned, spatialLevels) {
    return __awaiter(this, void 0, void 0, function* () {
        let config;
        if (typeof context.info.projectionFloorConfig === 'undefined') {
            config = new spinal_core_connectorjs_1.Lst();
            context.info.add_attr('projectionFloorConfig', new spinal_core_connectorjs_1.Ptr(config));
        }
        else
            config = yield context.info.projectionFloorConfig.load();
        for (const spatialLevel of spatialLevels) {
            let levelConfig = config.detect((item) => item.floorId.get() === spatialLevel.floorId);
            if (!levelConfig) {
                levelConfig = new spinal_core_connectorjs_1.Model({
                    floorId: spatialLevel.floorId,
                    floorData: new spinal_core_connectorjs_1.Lst(),
                });
                config.push(levelConfig);
            }
            const itemsInFloor = levelsFoundAssigned.filter((a) => a.targetFloorId === spatialLevel.floorId);
            for (const itemInFloor of itemsInFloor) {
                const levelItemCfg = levelConfig.floorData.detect((f) => {
                    return (f.bimFileId.get() === itemInFloor.bimFileId &&
                        f.floorDbId.get() === itemInFloor.floorDbId);
                });
                if (!levelItemCfg) {
                    // create new
                    const newLevelItem = new spinal_core_connectorjs_1.Model({
                        bimFileId: itemInFloor.bimFileId,
                        floorDbId: itemInFloor.floorDbId,
                    });
                    levelConfig.floorData.push(newLevelItem);
                }
            }
            // clean floorData that are not in levelsFoundAssigned
            const toRemove = [];
            for (let index = 0; index < levelConfig.floorData.length; index++) {
                const f = levelConfig.floorData[index];
                const found = itemsInFloor.find((a) => a.bimFileId === f.bimFileId.get() && a.floorDbId === f.floorDbId.get());
                if (!found)
                    toRemove.push(f);
            }
            for (const item of toRemove) {
                levelConfig.floorData.remove(item);
            }
        }
        return config.get();
    });
}
//# sourceMappingURL=updateProjectionFloorConfig.js.map