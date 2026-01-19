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

import type { ProjectionFloorItemModel } from '../../interfaces/ProjectionFloorItemModel';
import type { ProjectionFloorConfigModel } from '../../interfaces/ProjectionFloorConfigModel';
import type { SpinalContext } from 'spinal-model-graph';
import { Lst, Model, Ptr } from 'spinal-core-connectorjs';

export async function updateProjectionFloorConfig(
  context: SpinalContext,
  levelsFoundAssigned: {
    bimFileName: string;
    bimFileId: string;
    floorDbId: number;
    targetFloorName: string;
    targetFloorId: number;
  }[],
  spatialLevels: { name: string; floorId: number }[]
) {
  let config: Lst<ProjectionFloorConfigModel>;
  if (typeof context.info.projectionFloorConfig === 'undefined') {
    config = new Lst();
    context.info.add_attr('projectionFloorConfig', new Ptr(config));
  } else config = await context.info.projectionFloorConfig.load();

  for (const spatialLevel of spatialLevels) {
    let levelConfig = config.detect(
      (item) => item.floorId.get() === spatialLevel.floorId
    );
    if (!levelConfig) {
      levelConfig = new Model({
        floorId: spatialLevel.floorId,
        floorData: new Lst<ProjectionFloorItemModel>(),
      }) as ProjectionFloorConfigModel;
      config.push(levelConfig);
    }
    const itemsInFloor = levelsFoundAssigned.filter(
      (a) => a.targetFloorId === spatialLevel.floorId
    );
    for (const itemInFloor of itemsInFloor) {
      const levelItemCfg = levelConfig.floorData.detect((f) => {
        return (
          f.bimFileId.get() === itemInFloor.bimFileId &&
          f.floorDbId.get() === itemInFloor.floorDbId
        );
      });
      if (!levelItemCfg) {
        // create new
        const newLevelItem = new Model({
          bimFileId: itemInFloor.bimFileId,
          floorDbId: itemInFloor.floorDbId,
        }) as ProjectionFloorItemModel;
        levelConfig.floorData.push(newLevelItem);
      }
    }
    // clean floorData that are not in levelsFoundAssigned
    const toRemove: ProjectionFloorItemModel[] = [];
    for (let index = 0; index < levelConfig.floorData.length; index++) {
      const f: ProjectionFloorItemModel = levelConfig.floorData[index];
      const found = itemsInFloor.find(
        (a) =>
          a.bimFileId === f.bimFileId.get() && a.floorDbId === f.floorDbId.get()
      );
      if (!found) toRemove.push(f);
    }
    for (const item of toRemove) {
      levelConfig.floorData.remove(item);
    }
  }
  return config.get();
}
