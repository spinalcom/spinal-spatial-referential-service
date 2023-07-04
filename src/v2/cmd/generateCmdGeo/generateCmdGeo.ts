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

import type { SpinalNode } from 'spinal-model-graph';
import type { IFloorData } from '../../interfaces/IFloorData';
import type { ISkipItem } from '../../interfaces/ISkipItem';
import type { ICmdNew } from '../../interfaces/ICmdNew';
import { FileSystem } from 'spinal-core-connectorjs';
import { EModificationType } from '../../interfaces/IGetArchi';
import { getModType } from '../../utils/archi/getModType';
import { isInSkipList } from '../../utils/archi/isInSkipList';
import { handleFloorCmdNew } from './handleFloorCmdNew';
import { handleFloorUpdate } from './handleFloorUpdate';
import {
  ROOM_REFERENCE_CONTEXT,
  getOrCreateRefContext,
} from 'spinal-env-viewer-context-geographic-service';

export async function generateCmdGeo(
  data: IFloorData[],
  skipList: ISkipItem[],
  buildingServerId: number,
  bimFileId: string
) {
  const dataToDo: ICmdNew[][] = [];
  const buildingNode = <SpinalNode>FileSystem._objects[buildingServerId];
  const refContext = await getOrCreateRefContext(ROOM_REFERENCE_CONTEXT);

  for (const floorData of data) {
    if (isInSkipList(skipList, floorData.floorArchi.properties.externalId))
      continue;

    switch (getModType(floorData.floorArchi.properties.modificationType)) {
      case EModificationType.update:
      case EModificationType.none:
        if (!floorData.diff) {
          console.warn(
            `${floorData.floorArchi.properties.externalId} got update modification type but no Diff object`
          );
        } else {
          await handleFloorUpdate(
            floorData,
            buildingNode,
            dataToDo,
            skipList,
            bimFileId,
            refContext
          );
        }
        break;
      case EModificationType.create:
        await handleFloorCmdNew(
          floorData,
          buildingNode,
          bimFileId,
          dataToDo,
          skipList,
          refContext
        );
        break;
      default:
        // do nothing | no delete floor
        break;
    }
  }
  return dataToDo;
}
