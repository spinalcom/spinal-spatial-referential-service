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

import type { AuProps } from '../../interfaces/AuProps';
import type { IIntersectNotFound } from '../../interfaces/IIntersectNotFound';
import type { IIntersectRes } from '../../interfaces/IIntersectRes';
import type { ICmdMissing } from '../../interfaces/ICmdMissing';
import { getBulkProperties } from '../../utils/projection/getBulkProperties';
import { getDiffSelection } from './getDiffSelection';
import { getBimFileIdByModelId } from '../../utils/projection/getBimFileIdByModelId';

export async function createCmdNotFound(
  intersectRes: IIntersectRes
): Promise<ICmdMissing[]> {
  const notFound = getDiffSelection(intersectRes);
  const auProps = await getItemNames(notFound);
  const res: ICmdMissing[] = [];
  for (const auProp of auProps) {
    createCmdNotFoundItm(res, auProp);
  }
  return res;
}

export function createCmdNotFoundItm(
  target: ICmdMissing[],
  auProp: AuProps
): void {
  const bimFileId = getBimFileIdByModelId(auProp.modelId);
  const itm = target.find((it) => it.bimFileId === bimFileId);
  if (itm) {
    const tmp = itm.data.find((it) => it.dbid === auProp.dbId);
    if (!tmp) {
      itm.data.push({
        dbid: auProp.dbId,
        externalId: auProp.externalId,
        name: auProp.name,
      });
    }
  } else {
    target.push({
      type: 'CmdMissing',
      bimFileId,
      data: [
        {
          dbid: auProp.dbId,
          externalId: auProp.externalId,
          name: auProp.name,
        },
      ],
    });
  }
}

async function getItemNames(data: IIntersectNotFound[]) {
  const res: Promise<AuProps[]>[] = [];
  for (const { model, dbIds } of data) {
    res.push(getBulkProperties(model, dbIds));
  }

  return Promise.all(res).then((arr) => {
    const result: AuProps[] = [];
    for (const itms of arr) {
      result.push(...itms);
    }
    return result;
  });
}
