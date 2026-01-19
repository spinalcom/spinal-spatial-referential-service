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
import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { SpinalVec3 } from '../../interfaces/SpinalVec3';
import type { IMeshData } from '../../interfaces/IMeshData';
import type { IDbIdMeshData } from '../../interfaces/IDbIdMeshData';
import type { IDbIdCenter } from '../../interfaces/IDbIdCenter';
import { getBBoxAndMatrix, getViewer } from '../../utils';
import { getModifiedWorldBoundingBox } from '../../utils/projection/getModifiedWorldBoundingBox';
import { getPointOffset } from '../../utils/projection/getPointOffset';
import { getFragIds } from '../../utils/getFragIds';

// raycast job don't use webworker
import { raycastJob } from '../rayUtils/raycastJob';
// also raycast job but use webworker

export async function raycastItemToMesh(
  from: IAggregateDbidByModelItem[],
  to: IAggregateDbidSetByModelItem[],
  viewer: Autodesk.Viewing.Viewer3D = getViewer()
): Promise<IRaycastIntersectRes[]> {
  try {
    const [centerPoints, geometries] = await Promise.all([
      getCenterObjects(from, viewer),
      getMeshsData(to, viewer),
    ]);
    return raycastJob({ centerPoints, geometries });
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export function getCenterObjects(
  array: IAggregateDbidByModelItem[],
  viewer: Autodesk.Viewing.Viewer3D
): Promise<IDbIdCenter[]> {
  const res: Promise<IDbIdCenter>[] = [];
  for (const obj of array) {
    for (const item of obj.dbId) {
      // add offset here
      const center = getCenter(
        item.dbId,
        item.offset,
        obj.model,
        viewer,
        item.levelDbId
      );
      res.push(center);
    }
  }
  return Promise.all(res);
}

async function getCenter(
  dbId: number,
  offset: SpinalVec3,
  model: Autodesk.Viewing.Model,
  viewer: Autodesk.Viewing.Viewer3D,
  levelDbId?: number
): Promise<IDbIdCenter> {
  const { matrixWorld, bbox } = await getBBoxAndMatrix(dbId, model, viewer);
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  return {
    dbId,
    modelId: model.id,
    center: getPointOffset(center, offset, matrixWorld),
    levelDbId,
  };
}

export async function getMeshsData(
  array: IAggregateDbidSetByModelItem[],
  viewer: Autodesk.Viewing.Viewer3D
): Promise<IDbIdMeshData[]> {
  const res: Promise<IDbIdMeshData>[] = [];
  for (const { model, dbId } of array) {
    for (const dbIdItem of dbId) {
      res.push(getMesh(dbIdItem, model, viewer));
    }
  }
  const tmp = await Promise.all(res);
  return tmp.filter((item) => {
    return item != null;
  });
}

async function getMesh(
  dbIdItem: number,
  model: Autodesk.Viewing.Model,
  viewer: Autodesk.Viewing.Viewer3D
): Promise<IDbIdMeshData> {
  try {
    const ids = await getFragIds(dbIdItem, model);
    const meshs = ids.map((fragId) =>
      viewer.impl.getRenderProxy(model, fragId)
    );
    const bbox = getModifiedWorldBoundingBox(ids, model);
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    const dataMesh = meshs.map((mesh): IMeshData => {
      return {
        geometry: {
          vb: mesh.geometry.vb,
          vblayout: mesh.geometry.vblayout,
          attributes: mesh.geometry.attributes,
          ib: mesh.geometry.ib,
          indices: mesh.geometry.indices,
          index: mesh.geometry.index,
          offsets: mesh.geometry.offsets,
          vbstride: mesh.geometry.vbstride,
        },
        matrixWorld: mesh.matrixWorld,
        center,
        bbox,
      };
    });
    return {
      dataMesh,
      dbId: dbIdItem,
      modelId: model.id,
    };
  } catch (e) {
    console.log('getMeshsData no fragId in', dbIdItem);
    return null;
  }
}
