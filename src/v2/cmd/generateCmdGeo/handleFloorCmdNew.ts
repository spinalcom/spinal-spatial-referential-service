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

import type {
  INodeInfo,
  IRoomArchi,
  IStructures,
} from '../../interfaces/IGetArchi';
import type { SpinalNode } from 'spinal-model-graph';
import type { IFloorData } from '../../interfaces/IFloorData';
import type { ISkipItem } from '../../interfaces/ISkipItem';
import type { ICmdNew } from '../../interfaces/ICmdNew';
import { parseUnit } from '../../scripts/transformArchi';
import { guid } from '../../utils/guid';
import { isInSkipList } from '../../utils/archi/isInSkipList';

export function handleFloorCmdNew(
  floorData: IFloorData,
  buildingNode: SpinalNode,
  bimFileId: string,
  dataToDo: ICmdNew[][],
  skipList: ISkipItem[]
) {
  const floorCmd = getFloorCmdNew(floorData, buildingNode, bimFileId);
  dataToDo.push([floorCmd]);
  // floor ref structs
  const floorRefCmds = getFloorRefCmdNew(
    floorData.floorArchi.structures,
    floorCmd.id,
    bimFileId,
    'floorRef'
  );
  // rooms
  const { roomCmds, roomRefCmds } = getFloorRoomsCmdNew(
    floorData,
    floorCmd,
    bimFileId,
    skipList
  );
  const floorRefAndRoomCmds = floorRefCmds.concat(roomCmds);
  if (floorRefAndRoomCmds.length > 0) dataToDo.push(floorRefAndRoomCmds);
  if (roomRefCmds.length > 0) dataToDo.push(roomRefCmds);
}

function getFloorRoomsCmdNew(
  floorData: IFloorData,
  floorCmd: ICmdNew,
  bimFileId: string,
  skipList: ISkipItem[]
) {
  const roomCmds: ICmdNew[] = [];
  const roomRefCmds: ICmdNew[] = [];
  for (const floorExtId in floorData.floorArchi.children) {
    if (
      Object.prototype.hasOwnProperty.call(
        floorData.floorArchi.children,
        floorExtId
      )
    ) {
      const roomArchi = floorData.floorArchi.children[floorExtId];
      if (isInSkipList(skipList, roomArchi.properties.externalId)) continue;
      getRoomCmd(roomArchi, floorCmd.id, bimFileId, roomCmds, roomRefCmds);
    }
  }
  return { roomCmds, roomRefCmds };
}

export function getRoomCmd(
  roomArchi: IRoomArchi,
  pNId: string,
  bimFileId: string,
  roomCmds: ICmdNew[],
  roomRefCmds: ICmdNew[]
) {
  let name = '';
  let number = undefined;
  const attr = roomArchi.properties.properties.map((itm) => {
    if (itm.name === 'name') name = <string>itm.value;
    if (itm.name === 'number') number = <string>itm.value;
    return {
      label: itm.name,
      value: itm.value,
      unit: parseUnit(itm.dataTypeContext),
    };
  });
  name = number ? `${number}-${name}` : name;
  const roomCmd: ICmdNew = {
    pNId,
    id: guid(),
    type: 'room',
    name,
    info: {
      dbid: roomArchi.properties.dbId,
      externalId: roomArchi.properties.externalId,
      bimFileId,
    },
    attr,
  };
  roomCmds.push(roomCmd);
  roomArchi.children.forEach((nodeInfo) => {
    const roomRefCmd = getRefCmd(nodeInfo, roomCmd.id, 'roomRef', bimFileId);
    roomRefCmds.push(roomRefCmd);
  });
}

function getFloorRefCmdNew(
  structures: IStructures,
  floorId: string,
  bimFileId: string,
  type: string
): ICmdNew[] {
  const refObjs: ICmdNew[] = [];
  for (const RefExtId in structures) {
    if (Object.prototype.hasOwnProperty.call(structures, RefExtId)) {
      const { properties } = structures[RefExtId];
      const struct: ICmdNew = getRefCmd(properties, floorId, type, bimFileId);
      refObjs.push(struct);
    }
  }
  return refObjs;
}
export function getRefCmd(
  properties: INodeInfo,
  pNId: string,
  type: string,
  bimFileId: string
): ICmdNew {
  let name = '';
  properties.properties.forEach((itm) => {
    if (itm.name === 'name') name = <string>itm.value;
  });
  return {
    pNId,
    id: guid(),
    type,
    name,
    info: {
      dbid: properties.dbId,
      externalId: properties.externalId,
      bimFileId,
    },
  };
}
function getFloorCmdNew(
  floorData: IFloorData,
  buildingNode: SpinalNode,
  bimFileId: string
): ICmdNew {
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
    pNId: buildingNode.info.id.get(),
    id: guid(),
    type: 'floor',
    name,
    info,
    attr,
  };
}
