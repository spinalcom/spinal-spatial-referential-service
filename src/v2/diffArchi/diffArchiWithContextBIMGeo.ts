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

import type { IFloorData, IGetArchi, TManualAssingment } from '../interfaces';
import { diffFloorWithContext } from './diffFloorWithContext';
import { mergeManualAssignArchiFloor } from './mergeManualAssignArchiFloor';
import { getOrLoadModel } from '../utils/getOrLoadModel';
import { SpinalContext } from 'spinal-model-graph';

export async function diffArchiWithContextBIMGeo(
  archiData: IGetArchi,
  BIMGeocontextServId: number,
  manualAssingment: TManualAssingment
) {
  const context = await getOrLoadModel<SpinalContext>(BIMGeocontextServId);
  const data = await mergeManualAssignArchiFloor(
    archiData,
    manualAssingment,
    context
  );
  const archiDataRes: IFloorData[] = [];
  for (const floorArchi of data) {
    const diff = await diffFloorWithContext(
      floorArchi,
      context,
      manualAssingment
    );
    archiDataRes.push({ diff, floorArchi });
  }

  return archiDataRes;
}
