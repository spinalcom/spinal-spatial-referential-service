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

import type { IProjectionOffset } from '../../interfaces/IProjectionOffset';
import type { SpinalVec3 } from '../../interfaces/SpinalVec3';
import type { TProjectionItem } from '../../interfaces';
import type { IPrevewItemToShow } from '../../interfaces/IPrevewItemToShow';
import type { IPreviewObj } from '../../interfaces/IPreviewObj';
import { getBBoxAndMatrixs } from '../../utils/projection/getBBoxAndMatrixs';
import { getLeafDbIdsByModelId } from '../../utils/projection/getLeafDbIdsByModelId';
import { getPointOffset } from '../../utils/projection/getPointOffset';
import { transformRtzToXyz } from '../../utils/projection/transformRtzToXyz';
import { isProjectionGroup } from '../../utils/projection/isProjectionGroup';
import throttle from 'lodash.throttle';
import {
  OVERLAY_LINES_PREVIEW_POSITION_NAME,
  OVERLAY_SPHERES_PREVIEW_POSITION_NAME,
} from '../../constant';

let current: IPreviewObj = null;
let sphereMat: THREE.MeshPhongMaterial = null;
let lineMat: THREE.LineBasicMaterial = null;
let sceneSphereOverlay: THREE.Scene = null;
let sceneLineOverlay: THREE.Scene = null;
let color = '#00ff00';
export const previewItem = throttle(_previewItem, 1000);

async function _previewItem(
  item: TProjectionItem,
  offset: IProjectionOffset,
  mode: number,
  viewer: Autodesk.Viewing.Viewer3D
): Promise<void> {
  const _offset = transformRtzToXyz(offset);
  if (current === null) {
    createNew(item, _offset);
  }
  try {
    current.offset = _offset;
    populateItemToShow(item, mode);
    await getBBoxAndMatrixs(current, viewer);
    for (const itm of current.itemToShow) {
      updatePointOffset(itm, _offset, viewer);
    }
    viewer.impl.invalidate(true, true, true);
  } catch (e) {
    console.error(e);
  }
}

export function stopPreview(viewer: Autodesk.Viewing.Viewer3D): Promise<void> {
  const curr = current;
  if (curr === null) return Promise.resolve();
  curr.lock = true;
  for (const itm of curr.itemToShow) {
    hideItem(itm);
  }
  viewer.impl.invalidate(true, true, true);
  current = null;
  viewer.impl.invalidate(true, true, true);
}

export function setColorPreview(colorStr: string): void {
  color = colorStr;
  if (sphereMat) sphereMat.color.set(color);
  if (lineMat) lineMat.color.set(color);
}
export function getColorPreview(): string {
  return color;
}

function createNew(item: TProjectionItem, offset: SpinalVec3): void {
  current = {
    item,
    mode: 0,
    offset,
    lock: false,
    itemToShow: [],
  };
}

function populateItemToShow(item: TProjectionItem, mode: number): void {
  const curr = current;
  if (curr.mode !== mode) {
    if (mode === 0) {
      for (const itm of curr.itemToShow) {
        hideItem(itm);
      }
      curr.itemToShow = [];
      curr.mode = mode;
    } else if (mode === 1) {
      if (isProjectionGroup(item)) {
        const first = item.computedData[0];
        if (typeof first === 'undefined') return;
        const ids = getLeafDbIdsByModelId(first.modelId, first.dbId);
        if (ids.length === 0) return;
        for (const itm of curr.itemToShow) {
          hideItem(itm);
        }
        curr.itemToShow = [{ dbId: ids[0], modelId: first.modelId }];
      } else {
        const ids = getLeafDbIdsByModelId(item.modelId, item.dbId);
        if (ids.length === 0) return;
        for (const itm of curr.itemToShow) {
          hideItem(itm);
        }
        curr.itemToShow = [{ dbId: ids[0], modelId: item.modelId }];
      }
    } else {
      if (isProjectionGroup(item)) {
        for (const itm of curr.itemToShow) {
          hideItem(itm);
        }
        curr.itemToShow = [];
        for (const itm of item.computedData) {
          const ids = getLeafDbIdsByModelId(itm.modelId, itm.dbId);
          if (ids.length === 0) continue;
          for (const id of ids) {
            curr.itemToShow.push({ dbId: id, modelId: itm.modelId });
          }
        }
      } else {
        for (const itm of curr.itemToShow) {
          hideItem(itm);
        }
        const ids = getLeafDbIdsByModelId(item.modelId, item.dbId);
        if (ids.length === 0) return;
        curr.itemToShow = [];
        for (const id of ids) {
          curr.itemToShow.push({ dbId: id, modelId: item.modelId });
        }
      }
    }
    curr.mode = mode;
  }
}

function hideItem(item: IPrevewItemToShow): void {
  sceneSphereOverlay.remove(item.sphere);
  sceneLineOverlay.remove(item.line);
}

function getSphereMat(
  viewer: Autodesk.Viewing.Viewer3D
): THREE.MeshPhongMaterial {
  if (sphereMat === null) {
    sphereMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const { scene } = viewer.impl.createOverlayScene(
      OVERLAY_SPHERES_PREVIEW_POSITION_NAME,
      sphereMat
    );
    sceneSphereOverlay = scene;
  }
  return sphereMat;
}
function getLineMat(
  viewer: Autodesk.Viewing.Viewer3D
): THREE.LineBasicMaterial {
  if (lineMat === null) {
    lineMat = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      depthWrite: true,
      depthTest: true,
      linewidth: 3,
      opacity: 1.0,
    });
    const { scene } = viewer.impl.createOverlayScene(
      OVERLAY_LINES_PREVIEW_POSITION_NAME,
      lineMat
    );
    sceneLineOverlay = scene;
  }
  return lineMat;
}
function updatePointOffset(
  item: IPrevewItemToShow,
  offset: SpinalVec3,
  viewer: Autodesk.Viewing.Viewer3D
): void {
  const matrixWorld = item.matrixWorld;
  const bbox = item.bbox;
  const bBoxCenter = new THREE.Vector3();
  bbox.getCenter(bBoxCenter);
  const point = getPointOffset(bBoxCenter, offset, matrixWorld);
  const sphere = getOrCreateSphere(item, viewer);
  sphere.position.set(point.x, point.y, point.z);
  sphere.updateMatrix();
  const line = getOrCreateLine(item, bBoxCenter, viewer);
  if (line.geometry instanceof THREE.BufferGeometry) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    line.geometry.attributes.position.needsUpdate = true;
  } else {
    line.geometry.verticesNeedUpdate = true;
  }
}

function getOrCreateSphere(
  item: IPrevewItemToShow,
  viewer: Autodesk.Viewing.Viewer3D
): THREE.Mesh {
  if (typeof item.sphere === 'undefined') {
    const material_green = getSphereMat(viewer);
    const sphere_geo = new THREE.SphereGeometry(0.4, 30, 30);
    const sphere_maxpt = new THREE.Mesh(sphere_geo, material_green);
    sphere_maxpt.matrixAutoUpdate = false;
    viewer.impl.addOverlay(OVERLAY_SPHERES_PREVIEW_POSITION_NAME, sphere_maxpt);
    item.sphere = sphere_maxpt;
  }
  return item.sphere;
}
function getOrCreateLine(
  item: IPrevewItemToShow,
  bBoxCenter: THREE.Vector3,
  viewer: Autodesk.Viewing.Viewer3D
): THREE.Line {
  if (typeof item.line === 'undefined') {
    const geometryLine = new THREE.Geometry();
    geometryLine.vertices.push(
      new THREE.Vector3(bBoxCenter.x, bBoxCenter.y, bBoxCenter.z),
      item.sphere.position
    );
    const material = getLineMat(viewer);
    const line = new THREE.Line(geometryLine, material);
    viewer.impl.addOverlay(OVERLAY_LINES_PREVIEW_POSITION_NAME, line);
    item.line = line;
  }
  return item.line;
}
