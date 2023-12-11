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

import type { IStructures } from '../../interfaces/IGetArchi';
import type { SpinalContext } from 'spinal-model-graph';
import type { IFloorData } from '../../interfaces/IFloorData';
import type { ISkipItem } from '../../interfaces/ISkipItem';
import type {
  ICmdNew,
  ICmdNewRef,
  ICmdNewSpace,
} from '../../interfaces/ICmdNew';
import { parseUnit } from '../../scripts/transformArchi';
import { guid } from '../../utils/guid';
import { isInSkipList } from '../../utils/archi/isInSkipList';
import { getRefCmd } from './getRefCmd';
import { getRoomCmd } from './getRoomCmd';

export async function handleFloorCmdNew(
  floorData: IFloorData,
  parentNodeId: string,
  bimFileId: string,
  skipList: ISkipItem[],
  refContext: SpinalContext,
  contextId: string,
  floors: ICmdNewSpace[],
  floorRefs: ICmdNewRef[],
  rooms: ICmdNewSpace[],
  roomRefs: ICmdNewRef[]
) {
  const floorCmd = getFloorCmdNew(
    floorData,
    parentNodeId,
    bimFileId,
    contextId
  );
  // floor ref structs
  getFloorRefCmdNew(
    floorData.floorArchi.structures,
    floorCmd.id,
    bimFileId,
    floorRefs
  );
  // rooms
  await getFloorRoomsCmdNew(
    floorData,
    floorCmd,
    bimFileId,
    skipList,
    refContext,
    contextId,
    rooms,
    roomRefs
  );
  floors.push(floorCmd);
}

async function getFloorRoomsCmdNew(
  floorData: IFloorData,
  floorCmd: ICmdNew,
  bimFileId: string,
  skipList: ISkipItem[],
  refContext: SpinalContext,
  contextId: string,
  roomCmds: ICmdNewSpace[],
  roomRefCmds: ICmdNewRef[]
) {
  for (const floorExtId in floorData.floorArchi.children) {
    if (
      Object.prototype.hasOwnProperty.call(
        floorData.floorArchi.children,
        floorExtId
      )
    ) {
      const roomArchi = floorData.floorArchi.children[floorExtId];
      if (isInSkipList(skipList, roomArchi.properties.externalId)) continue;
      await getRoomCmd(
        roomArchi,
        floorCmd.id,
        bimFileId,
        roomCmds,
        roomRefCmds,
        refContext,
        contextId
      );
    }
  }
}

function getFloorRefCmdNew(
  structures: IStructures,
  floorId: string,
  bimFileId: string,
  floorRefs: ICmdNewRef[]
) {
  for (const RefExtId in structures) {
    if (Object.prototype.hasOwnProperty.call(structures, RefExtId)) {
      const { properties } = structures[RefExtId];
      const struct: ICmdNewRef = getRefCmd(
        properties,
        floorId,
        'floorRef',
        bimFileId
      );
      floorRefs.push(struct);
    }
  }
}
function getFloorCmdNew(
  floorData: IFloorData,
  parentNodeId: string,
  bimFileId: string,
  contextId: string
): ICmdNewSpace {
  const info = {
    dbid: floorData.floorArchi.properties.dbId,
    externalId: floorData.floorArchi.properties.externalId,
    bimFileId,
  };
  let name = '';
  const attr = floorData.floorArchi.properties.properties.map((itm) => {
    if (itm.name === 'name') name = <string>itm.value;
    return {
      label: itm.name,
      value: itm.value,
      unit: parseUnit(itm.dataTypeContext),
    };
  });
  return {
    pNId: parentNodeId,
    contextId,
    id: guid(),
    type: 'floor',
    name,
    info,
    attr,
  };
}
