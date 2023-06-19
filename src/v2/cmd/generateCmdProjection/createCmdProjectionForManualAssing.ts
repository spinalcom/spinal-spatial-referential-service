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

import type { ICmdMissing } from '../../interfaces/ICmdMissing';
import type { ICmdProjection } from '../../interfaces/ICmdProjection';
import type { IManualAssingData } from '../../interfaces/IManualAssingData';
import { getModelByBimFileIdLoaded } from '../../utils';
import { getProperties } from '../../utils/projection/getProperties';
import { createCmdNotFoundItm } from './createCmdNotFoundItm';
import { createCmdProjItm } from './createCmdProjItm';

export async function createCmdProjectionForManualAssing(
  warnArr: IManualAssingData[],
  errorArr: IManualAssingData[]
) {
  const res: ICmdProjection[] = [];
  const resMiss: ICmdMissing[] = [];
  for (const warn of warnArr) {
    const bimObjectDbId = warn.dbid;
    const bimObjectModel = getModelByBimFileIdLoaded(warn.bimFileId);
    const auProp = await getProperties(bimObjectModel, bimObjectDbId);
    if (warn.validId) {
      createCmdProjItm(res, auProp, warn.validId, false);
    } else {
      createCmdProjItm(res, auProp, warn.PNId, true);
    }
  }
  for (const warn of errorArr) {
    const bimObjectDbId = warn.dbid;
    const bimObjectModel = getModelByBimFileIdLoaded(warn.bimFileId);
    const auProp = await getProperties(bimObjectModel, bimObjectDbId);
    if (warn.validId) {
      createCmdProjItm(res, auProp, warn.validId, false);
    } else {
      createCmdNotFoundItm(resMiss, auProp);
    }
  }
  return { cmd: res, cmdMiss: resMiss };
}
