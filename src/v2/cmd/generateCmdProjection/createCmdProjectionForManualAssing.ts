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

import { consumeBatch } from '../../../utils/consumeBatch';
import type { ICmdMissing } from '../../interfaces/ICmdMissing';
import type { ICmdProjection } from '../../interfaces/ICmdProjection';
import type { IManualAssingData } from '../../interfaces/IManualAssingData';
import { getModelByBimFileIdLoaded } from '../../utils';
import { getProperties } from '../../utils/projection/getProperties';
import { createCmdNotFoundItm } from './createCmdNotFoundItm';
import { createCmdProjItm } from './createCmdProjItm';
import { getCenterPos } from './getCenterPos';

export async function createCmdProjectionForManualAssing(
  warnArr: IManualAssingData[],
  errorArr: IManualAssingData[]
) {
  const res: ICmdProjection[] = [];
  const resMiss: ICmdMissing[] = [];
  const proms = [];
  for (const warn of warnArr) {
    const bimObjectDbId = warn.dbid;
    proms.push(() => handleWarnCmd(warn, bimObjectDbId, res));
  }
  for (const err of errorArr) {
    const bimObjectDbId = err.dbid;
    proms.push(() => handleErrCmd(err, bimObjectDbId, res, resMiss));
  }
  await consumeBatch(
    proms,
    20,
    console.log.bind(null, 'createCmdProjectionForManualAssing %d/%d')
  );
  return { cmd: res, cmdMiss: resMiss };
}

async function handleErrCmd(
  err: IManualAssingData,
  bimObjectDbId: number,
  res: ICmdProjection[],
  resMiss: ICmdMissing[]
) {
  const bimObjectModel = getModelByBimFileIdLoaded(err.bimFileId);
  const auProp = await getProperties(bimObjectModel, bimObjectDbId);
  const centerPos = await getCenterPos(auProp);
  if (err.validId) {
    createCmdProjItm(res, auProp, err.validId, centerPos, false);
  } else {
    createCmdNotFoundItm(resMiss, auProp, centerPos);
  }
}

async function handleWarnCmd(
  warn: IManualAssingData,
  bimObjectDbId: number,
  res: ICmdProjection[]
) {
  const bimObjectModel = getModelByBimFileIdLoaded(warn.bimFileId);
  const auProp = await getProperties(bimObjectModel, bimObjectDbId);
  const centerPos = await getCenterPos(auProp);
  if (warn.validId) {
    createCmdProjItm(res, auProp, warn.validId, centerPos, false);
  } else {
    createCmdProjItm(res, auProp, warn.PNId, centerPos, true);
  }
}
