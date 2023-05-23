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

import type { SpinalVec3 } from '../../interfaces/SpinalVec3';

export function getPointOffset(
  orig: SpinalVec3,
  offset: SpinalVec3,
  matrixWorld: THREE.Matrix4
): THREE.Vector3 {
  const inverseMatrix = new THREE.Matrix4();
  const point = new THREE.Vector3(orig.x, orig.y, orig.z);
  const _offset = new THREE.Vector3(offset.x, offset.y, offset.z);
  inverseMatrix.getInverse(matrixWorld);
  point.applyMatrix4(inverseMatrix);
  point.add(_offset);
  point.applyMatrix4(matrixWorld);
  return point;
}
