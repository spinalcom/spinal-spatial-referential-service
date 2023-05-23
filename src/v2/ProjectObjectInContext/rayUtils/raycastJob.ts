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

import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
import { enumMeshTriangles } from './enumMeshTriangles';
import * as THREE from 'three'; // uncomment for worker usage
import type { IWorkerData } from '../../interfaces/IWorkerData';

export function raycastJob(data: IWorkerData): IRaycastIntersectRes[] {
  const centerPoints = data.centerPoints;
  const geometries = data.geometries;
  const res: IRaycastIntersectRes[] = [];
  for (const centerPoint of centerPoints) {
    const rayOrig = new THREE.Ray(
      new THREE.Vector3(
        centerPoint.center.x,
        centerPoint.center.y,
        centerPoint.center.z
      ),
      new THREE.Vector3(0, 0, -1)
    );
    let dbObjIntersection: IRaycastIntersectRes = null;
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
          enumMeshTriangles(
            mesh.geometry,
            function (vA: THREE.Vector3, vB: THREE.Vector3, vC: THREE.Vector3) {
              const tmp = new THREE.Vector3();
              const intersectionPoint = ray.intersectTriangle(
                vC,
                vB,
                vA,
                false,
                tmp
              );
              if (!intersectionPoint) return;
              intersectionPoint.applyMatrix4(mesh.matrixWorld);
              const distance = rayOrig.origin.distanceTo(intersectionPoint);
              // if dbObjIntersection don't exist or distance > to old distance
              if (
                !dbObjIntersection ||
                (dbObjIntersection &&
                  dbObjIntersection.intersections.distance > distance)
              ) {
                dbObjIntersection = {
                  origin: centerPoint,
                  intersections: {
                    distance,
                    modelId: intersectionObjs.modelId,
                    dbId: intersectionObjs.dbId,
                  },
                };
              }
            }
          );
        }
      }
    }
    if (dbObjIntersection) {
      res.push(dbObjIntersection);
    }
  }
  return res;
}

function isPointOnTopOfBBox(bBox: THREE.Box3, point: THREE.Vector3): boolean {
  // test if point on top of bbox
  if (
    bBox.min.x <= point.x &&
    point.x <= bBox.max.x &&
    bBox.min.y <= point.y &&
    point.y <= bBox.max.y &&
    point.z >= bBox.min.z
  ) {
    return true;
  }
  return false;
}
