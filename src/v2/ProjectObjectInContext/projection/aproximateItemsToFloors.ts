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

import { FileSystem } from 'spinal-core-connectorjs';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import type { IDbIdMeshData } from '../../interfaces/IDbIdMeshData';
import { getBimFileIdByModelId, getViewer } from '../../utils';
import type { ProjectionFloorConfig } from '../../interfaces/ProjectionFloorConfig';
import type { SpinalNode } from 'spinal-model-graph';
import { getCenterObjects, getMeshsData } from './raycastItemToMesh';
import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
import type { IDbIdCenter } from '../../interfaces/IDbIdCenter';
import { enumMeshTriangles } from './../rayUtils/enumMeshTriangles';
import * as THREE from 'three'; // uncomment for worker usage

export async function aproximateItemsToFloors(
  itemsToAproximate: IAggregateDbidByModelItem[],
  roomRefsByFloor: Record<string, IAggregateDbidSetByModelItem[]>,
  configFloorProjections: ProjectionFloorConfig[]
) {
  const meshesByFloorNodeId: Record<string, IDbIdMeshData[]> = {};
  const promises = Object.entries(roomRefsByFloor).map(
    async ([floorNodeId, aggre]) => {
      meshesByFloorNodeId[floorNodeId] = await getMeshsData(aggre, getViewer());
    }
  );

  const centerObjects = await getCenterObjects(itemsToAproximate, getViewer());
  await Promise.all(promises);

  return await aproximateItemsToFloorsJob(
    centerObjects,
    meshesByFloorNodeId,
    configFloorProjections
  );
}

async function aproximateItemsToFloorsJob(
  centerObjects: IDbIdCenter[],
  meshesByFloorNodeId: Record<string, IDbIdMeshData[]>,
  configFloorProjections: ProjectionFloorConfig[]
) {
  const res: IRaycastIntersectRes[] = [];
  const triangle = new THREE.Triangle();

  for (const centerPoint of centerObjects) {
    const floorNodeId = await getFloorNodeIdByLevelDbIdAndModel(
      centerPoint.levelDbId!,
      centerPoint.modelId,
      configFloorProjections
    );
    const intersectionsObjs = meshesByFloorNodeId[floorNodeId];
    if (!intersectionsObjs) continue;
    let dbObjIntersection: IRaycastIntersectRes = null;
    const closestPoint = new THREE.Vector3();
    for (const intersectionObjs of intersectionsObjs) {
      for (const mesh of intersectionObjs.dataMesh) {
        enumMeshTriangles(
          mesh.geometry,
          (vA: THREE.Vector3, vB: THREE.Vector3, vC: THREE.Vector3) => {
            // @ts-ignore
            triangle.set(vA, vB, vC);
            // @ts-ignore
            triangle.closestPointToPoint(centerPoint.center, closestPoint);
            // if closestPoint is above centerPoint z, skip
            // allow to filter objects with wrong elevation
            if (closestPoint.z > centerPoint.center.z) return;
            const distance = centerPoint.center.distanceTo(closestPoint);
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
    if (dbObjIntersection) {
      res.push(dbObjIntersection);
    }
  }
  return res;
}

async function getFloorNodeIdByLevelDbIdAndModel(
  levelDbId: number,
  modelId: number,
  configFloorProjections: ProjectionFloorConfig[]
) {
  const bimFileId = getBimFileIdByModelId(modelId);

  for (const configFloorProjection of configFloorProjections) {
    for (const floorData of configFloorProjection.floorData) {
      if (
        floorData.bimFileId === bimFileId &&
        floorData.floorDbId === levelDbId
      ) {
        const floorServerId = configFloorProjection.floorId;
        const item = FileSystem._objects[floorServerId] as SpinalNode;
        return item.info.id.get();
      }
    }
  }
}
