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

import type { AuProps } from '../../interfaces';
import type { ICmdProjection } from '../../interfaces/ICmdProjection';
import { getCategory } from './getCategory';
import { getBimFileIdByModelId } from '../../utils/projection/getBimFileIdByModelId';

export function createCmdProjItm(
  target: ICmdProjection[],
  auProp: AuProps,
  pNId: string,
  centerPos: string,
  flagWarining: boolean
) {
  const bimFileId = getBimFileIdByModelId(auProp.modelId);
  const itm = target.find(
    (it) => it.bimFileId === bimFileId && pNId === it.pNId
  );
  const revitCat = <string>getCategory(auProp)?.displayValue;
  if (itm) {
    const tmp = itm.data.find((it) => it.dbid === auProp.dbId);
    if (!tmp) {
      itm.data.push({
        dbid: auProp.dbId,
        externalId: auProp.externalId,
        name: auProp.name,
        revitCat: revitCat,
        centerPos,
        flagWarining,
      });
    }
  } else {
    target.push({
      type: 'CmdProjection',
      pNId,
      bimFileId,
      data: [
        {
          dbid: auProp.dbId,
          externalId: auProp.externalId,
          name: auProp.name,
          revitCat: revitCat,
          centerPos,
          flagWarining,
        },
      ],
    });
  }
}
