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

import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { ProjectionFloorItem } from '../../interfaces/ProjectionFloorItem';
import { getBimFileIdByModelId } from '../../utils/projection/getBimFileIdByModelId';
import { getOrCreateProjectionFloorConfig } from './getOrCreateProjectionFloorConfig';
import { getBulkProperties_withOptions } from './getBulkProperties_withOptions';
import { getProperties } from '../../utils/projection/getProperties';

export async function initFloorAssign(
  lstItemsToAproximate: IAggregateDbidByModelItem[][],
  context: SpinalContext
) {
  const levelsFound = await fetchUsedFloors(lstItemsToAproximate);
  // load floor form Spatial
  const floorNodes = await getFloorNodesFromContext(context);
  const configFloorProjection = await getOrCreateProjectionFloorConfig(context);
  for (const floorNode of floorNodes) {
    let floorConfig = configFloorProjection.find(
      (a) => a.floorId === floorNode._server_id
    );
    if (!floorConfig) {
      floorConfig = {
        floorId: floorNode._server_id,
        floorData: [],
      };
      configFloorProjection.push(floorConfig);
    } else {
      // remove the levelsFound that are already in config
      for (const item of floorConfig.floorData) {
        const index = levelsFound.findIndex(
          (f) =>
            f.bimFileId === item.bimFileId && f.floorDbId === item.floorDbId
        );
        if (index !== -1) {
          levelsFound.splice(index, 1);
        }
      }
    }
  }
  return { levelsFound, configFloorProjection };
}

async function getFloorNodesFromContext(context: SpinalContext) {
  const floorNodes: SpinalNode[] = [];
  const buildingNodes = await context.getChildrenInContext(context);
  for (const buildingNode of buildingNodes) {
    const floorNodesInContext = await buildingNode.getChildrenInContext(
      context
    );
    floorNodes.push(...floorNodesInContext);
  }
  return floorNodes;
}

async function fetchUsedFloors(
  lstItemsToAproximate: IAggregateDbidByModelItem[][]
) {
  const levelsFounds: ProjectionFloorItem[] = [];
  for (const items of lstItemsToAproximate) {
    for (const item of items) {
      const dbIds = item.dbId.map((d) => d.dbId);
      const bulkLevelData = await getBulkProperties_withOptions(
        item.model,
        dbIds,
        {
          propFilter: ['Level'],
          ignoreHidden: false,
        }
      );
      for (const r of bulkLevelData) {
        const levelProp = r.properties.find(
          (p) =>
            p.displayCategory === '__internalref__' &&
            p.attributeName === 'Level'
        );
        if (levelProp) {
          const data = item.dbId.find((d) => d.dbId === r.dbId);
          if (data) {
            data.levelDbId = levelProp.displayValue as number;
          }
          if (item.floors === undefined) {
            item.floors = [];
          }
          if (!item.floors.find((f) => f.dbId === levelProp.displayValue)) {
            const floorData = await getProperties(
              item.model,
              levelProp.displayValue as number
            );
            item.floors.push({
              name: floorData.name,
              dbId: levelProp.displayValue as number,
            });
            // test if exist in levelsFounds
            const bimFileId = getBimFileIdByModelId(item.model.id);
            if (
              !levelsFounds.find(
                (f) =>
                  f.bimFileId === bimFileId &&
                  f.floorDbId === (levelProp.displayValue as number)
              )
            ) {
              levelsFounds.push({
                bimFileId: bimFileId,
                floorDbId: levelProp.displayValue as number,
                name: floorData.name,
              });
            }
          }
        }
      }
    }
  }
  return levelsFounds;
}
