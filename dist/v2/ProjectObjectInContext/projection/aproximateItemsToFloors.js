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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.aproximateItemsToFloors = aproximateItemsToFloors;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const utils_1 = require("../../utils");
const raycastItemToMesh_1 = require("./raycastItemToMesh");
const enumMeshTriangles_1 = require("./../rayUtils/enumMeshTriangles");
const THREE = __importStar(require("three")); // uncomment for worker usage
function aproximateItemsToFloors(itemsToAproximate, roomRefsByFloor, configFloorProjections) {
    return __awaiter(this, void 0, void 0, function* () {
        const meshesByFloorNodeId = {};
        const promises = Object.entries(roomRefsByFloor).map((_a) => __awaiter(this, [_a], void 0, function* ([floorNodeId, aggre]) {
            meshesByFloorNodeId[floorNodeId] = yield (0, raycastItemToMesh_1.getMeshsData)(aggre, (0, utils_1.getViewer)());
        }));
        const centerObjects = yield (0, raycastItemToMesh_1.getCenterObjects)(itemsToAproximate, (0, utils_1.getViewer)());
        yield Promise.all(promises);
        return yield aproximateItemsToFloorsJob(centerObjects, meshesByFloorNodeId, configFloorProjections);
    });
}
function aproximateItemsToFloorsJob(centerObjects, meshesByFloorNodeId, configFloorProjections) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = [];
        const triangle = new THREE.Triangle();
        for (const centerPoint of centerObjects) {
            const floorNodeId = yield getFloorNodeIdByLevelDbIdAndModel(centerPoint.levelDbId, centerPoint.modelId, configFloorProjections);
            const intersectionsObjs = meshesByFloorNodeId[floorNodeId];
            if (!intersectionsObjs)
                continue;
            let dbObjIntersection = null;
            const closestPoint = new THREE.Vector3();
            for (const intersectionObjs of intersectionsObjs) {
                for (const mesh of intersectionObjs.dataMesh) {
                    (0, enumMeshTriangles_1.enumMeshTriangles)(mesh.geometry, (vA, vB, vC) => {
                        // @ts-ignore
                        triangle.set(vA, vB, vC);
                        // @ts-ignore
                        triangle.closestPointToPoint(centerPoint.center, closestPoint);
                        // if closestPoint is above centerPoint z, skip
                        // allow to filter objects with wrong elevation
                        if (closestPoint.z > centerPoint.center.z)
                            return;
                        const distance = centerPoint.center.distanceTo(closestPoint);
                        // if dbObjIntersection don't exist or distance > to old distance
                        if (!dbObjIntersection ||
                            (dbObjIntersection &&
                                dbObjIntersection.intersections.distance > distance)) {
                            dbObjIntersection = {
                                origin: centerPoint,
                                intersections: {
                                    distance,
                                    modelId: intersectionObjs.modelId,
                                    dbId: intersectionObjs.dbId,
                                },
                            };
                        }
                    });
                }
            }
            if (dbObjIntersection) {
                res.push(dbObjIntersection);
            }
        }
        return res;
    });
}
function getFloorNodeIdByLevelDbIdAndModel(levelDbId, modelId, configFloorProjections) {
    return __awaiter(this, void 0, void 0, function* () {
        const bimFileId = (0, utils_1.getBimFileIdByModelId)(modelId);
        for (const configFloorProjection of configFloorProjections) {
            for (const floorData of configFloorProjection.floorData) {
                if (floorData.bimFileId === bimFileId &&
                    floorData.floorDbId === levelDbId) {
                    const floorServerId = configFloorProjection.floorId;
                    const item = spinal_core_connectorjs_1.FileSystem._objects[floorServerId];
                    return item.info.id.get();
                }
            }
        }
    });
}
//# sourceMappingURL=aproximateItemsToFloors.js.map