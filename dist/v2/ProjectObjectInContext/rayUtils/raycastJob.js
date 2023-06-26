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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.raycastJob = void 0;
const enumMeshTriangles_1 = require("./enumMeshTriangles");
const THREE = __importStar(require("three")); // uncomment for worker usage
function raycastJob(data) {
    const centerPoints = data.centerPoints;
    const geometries = data.geometries;
    const res = [];
    for (const centerPoint of centerPoints) {
        const rayOrig = new THREE.Ray(new THREE.Vector3(centerPoint.center.x, centerPoint.center.y, centerPoint.center.z), new THREE.Vector3(0, 0, -1));
        let dbObjIntersection = null;
        for (const intersectionObjs of geometries) {
            const inverseMatrix = new THREE.Matrix4();
            for (const mesh of intersectionObjs.dataMesh) {
                const ray = rayOrig.clone();
                inverseMatrix.getInverse(mesh.matrixWorld);
                ray.applyMatrix4(inverseMatrix);
                // test if point on top of boundingbox
                const bboxFound = isPointOnTopOfBBox(mesh.bbox, rayOrig.origin);
                if (bboxFound) {
                    // test with boundingbox ok -> test with triangles
                    (0, enumMeshTriangles_1.enumMeshTriangles)(mesh.geometry, function (vA, vB, vC) {
                        const tmp = new THREE.Vector3();
                        const intersectionPoint = ray.intersectTriangle(vC, vB, vA, false, tmp);
                        if (!intersectionPoint)
                            return;
                        intersectionPoint.applyMatrix4(mesh.matrixWorld);
                        const distance = rayOrig.origin.distanceTo(intersectionPoint);
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
        }
        if (dbObjIntersection) {
            res.push(dbObjIntersection);
        }
    }
    return res;
}
exports.raycastJob = raycastJob;
function isPointOnTopOfBBox(bBox, point) {
    // test if point on top of bbox
    if (bBox.min.x <= point.x &&
        point.x <= bBox.max.x &&
        bBox.min.y <= point.y &&
        point.y <= bBox.max.y &&
        point.z >= bBox.min.z) {
        return true;
    }
    return false;
}
//# sourceMappingURL=raycastJob.js.map