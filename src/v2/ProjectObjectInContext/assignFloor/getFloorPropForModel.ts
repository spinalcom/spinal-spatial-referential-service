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

import type { IFloorPropForModel } from '../../interfaces/IFloorPropForModel';
import { getBulkProperties } from '../../utils/projection/getBulkProperties';
import { getAllModelLoaded } from '../../utils/projection/getAllModelLoaded';
import { getFloorsDbIdOfModel } from './getFloorsDbIdOfModel';

export async function getFloorPropForModel(): Promise<IFloorPropForModel> {
  const models = getAllModelLoaded();
  const res: IFloorPropForModel = {};
  for (const model of models) {
    const floorDbid = await getFloorsDbIdOfModel(model);
    const floorProps = await getBulkProperties(model, floorDbid, {
      propFilter: ['name', 'externalId'],
    });
    res[model.id] = floorProps.map((itm) => {
      return {
        id: itm.id,
        externalId: itm.externalId,
        dbId: itm.dbId,
        name: itm.name,
        modelId: model.id,
      };
    });
  }
  return res;
}
