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

import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import type { IFloorData } from '../../interfaces/IFloorData';
import type { ISkipItem } from '../../interfaces/ISkipItem';
import type {
  ICmdNew,
  ICmdNewDelete,
  ICmdNewRef,
  ICmdNewSpace,
} from '../../interfaces/ICmdNew';
import { EModificationType } from '../../interfaces/IGetArchi';
import { getModType } from '../../utils/archi/getModType';
import { isInSkipList } from '../../utils/archi/isInSkipList';
import { handleFloorCmdNew } from './handleFloorCmdNew';
import { handleFloorUpdate } from './handleFloorUpdate';
import {
  ROOM_REFERENCE_CONTEXT,
  getOrCreateRefContext,
} from 'spinal-env-viewer-context-geographic-service';
import { getOrLoadModel } from '../../utils/getOrLoadModel';
import { getContextSpatial, getGraph } from '../../utils';

export async function generateCmdGeo(
  data: IFloorData[],
  skipList: ISkipItem[],
  buildingServerId: number,
  bimFileId: string
) {
  const dataToDo: ICmdNew[][] = [];
  const buildingNode = <SpinalNode>await getOrLoadModel(buildingServerId);
  const refContext = await getOrCreateRefContext(ROOM_REFERENCE_CONTEXT);
  const graph = getGraph();
  const contextGeo = await getContextSpatial(graph);
  await generateCmdGeoLoop(
    data,
    skipList,
    buildingNode.info.id.get(),
    dataToDo,
    bimFileId,
    refContext,
    contextGeo.info.id.get()
  );
  return dataToDo;
}

export async function generateCmdBIMGeo(
  data: IFloorData[],
  skipList: ISkipItem[],
  BIMGeocontextServId: number,
  bimFileId: string
) {
  const dataToDo: ICmdNew[][] = [];
  const context = await getOrLoadModel<SpinalContext>(BIMGeocontextServId);
  const refContext = await getOrCreateRefContext(ROOM_REFERENCE_CONTEXT);
  const contextId = context.info.id.get();
  await generateCmdGeoLoop(
    data,
    skipList,
    contextId,
    dataToDo,
    bimFileId,
    refContext,
    contextId
  );
  return dataToDo;
}

async function generateCmdGeoLoop(
  data: IFloorData[],
  skipList: ISkipItem[],
  parentNodeId: string,
  dataToDo: ICmdNew[][],
  bimFileId: string,
  refContext: SpinalNode,
  contextId: string
) {
  const floors: ICmdNewSpace[] = [];
  const floorRefs: ICmdNewRef[] = [];
  const rooms: ICmdNewSpace[] = [];
  const roomRefs: ICmdNewRef[] = [];
  const itemDeletes: ICmdNewDelete[] = [];
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
            parentNodeId,
            skipList,
            bimFileId,
            refContext,
            contextId,
            floors,
            floorRefs,
            rooms,
            roomRefs,
            itemDeletes
          );
        }
        break;
      case EModificationType.create:
        await handleFloorCmdNew(
          floorData,
          parentNodeId,
          bimFileId,
          skipList,
          refContext,
          contextId,
          floors,
          floorRefs,
          rooms,
          roomRefs
        );
        break;
      default:
        // do nothing | no delete floor
        break;
    }
  }
  if (floors.length > 0) dataToDo.push(floors);
  if (floorRefs.length > 0) dataToDo.push(floorRefs);
  if (rooms.length > 0) dataToDo.push(rooms);
  if (roomRefs.length > 0) dataToDo.push(roomRefs);
  if (itemDeletes.length > 0) dataToDo.push(itemDeletes);
}
