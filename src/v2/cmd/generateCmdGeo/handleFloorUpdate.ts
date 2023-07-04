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
import type { ICmdNew, ICmdNewInfo } from '../../interfaces/ICmdNew';
import { FileSystem } from 'spinal-core-connectorjs';
import { IDiffNodeInfoAttr, IRoomArchi } from '../../interfaces/IGetArchi';
import { isInSkipList } from '../../utils/archi/isInSkipList';
import { getRefCmd, getRoomCmd } from './handleFloorCmdNew';
import { parseUnit } from '../../scripts/transformArchi';
import { guid } from '../../utils/guid';
import { getNodeInfoArchiAttr } from '../../utils/archi/getNodeInfoArchiAttr';
import { serverIdArrToNodeIdArr } from '../../utils/archi/serverIdArrToNodeIdArr';
import { REFERENCE_ROOM_RELATION } from 'spinal-env-viewer-context-geographic-service';
type ICmdRefChildren = {
  children: SpinalNode[];
  roomCmd: ICmdNew;
  roomArchi: IRoomArchi;
};

export async function handleFloorUpdate(
  floorData: IFloorData,
  buildingNode: SpinalNode,
  dataToDo: ICmdNew[][],
  skipList: ISkipItem[],
  bimFileId: string,
  refContext: SpinalContext
) {
  const floorNode = <SpinalNode>(
    FileSystem._objects[floorData.floorArchi.properties.spinalnodeServerId]
  );
  const floorCmd: ICmdNew = getFloorCmdUp(floorData, buildingNode, floorNode);
  dataToDo.push([floorCmd]);

  const floorCmds: ICmdNew[] = [];
  if (floorData.diff.diffRef.delBimObj.length > 0) {
    const delBimObj = {
      pNId: floorNode.info.id.get(),
      type: 'floorRefDel',
      nIdToDel: serverIdArrToNodeIdArr(floorData.diff.diffRef.delBimObj),
    };
    floorCmds.push(delBimObj);
  }
  const roomDelServerId = floorData.diff.diffRoom.delRooms.filter(
    (itm) => !isInSkipList(skipList, itm)
  );
  if (roomDelServerId.length > 0) {
    const floorRoomDel = {
      pNId: floorNode.info.id.get(),
      type: 'floorRoomDel',
      nIdToDel: serverIdArrToNodeIdArr(roomDelServerId),
    };
    floorCmds.push(floorRoomDel);
  }
  if (floorCmds.length > 0) dataToDo.push(floorCmds);

  const floorRefCmd = getFloorRefCmd(floorData, floorNode, bimFileId);
  const roomCmds: ICmdNew[] = [],
    roomRefCmds: ICmdNew[] = [];
  floorData.diff.diffRoom.newRooms.forEach((roomArchi) => {
    if (!isInSkipList(skipList, roomArchi.properties.externalId))
      getRoomCmd(
        roomArchi,
        floorNode.info.id.get(),
        bimFileId,
        roomCmds,
        roomRefCmds,
        refContext
      );
  });
  await getRoomCmdUp(
    floorData,
    floorNode,
    roomCmds,
    bimFileId,
    roomRefCmds,
    skipList
  );
  const floorRefAndRoomCmds = floorRefCmd.concat(roomCmds);
  if (floorRefAndRoomCmds.length > 0) dataToDo.push(floorRefAndRoomCmds);
  if (roomRefCmds.length > 0) dataToDo.push(roomRefCmds);
}

async function getRoomCmdUp(
  floorData: IFloorData,
  floorNode: SpinalNode,
  roomCmds: ICmdNew[],
  bimFileId: string,
  roomRefCmds: ICmdNew[],
  skipList: ISkipItem[]
) {
  const updatedRoomSet = new Set<string>();
  floorData.diff.diffRoom.newRooms.forEach((roomArchi) => {
    updatedRoomSet.add(roomArchi.properties.externalId);
  });
  for (const { diff, roomArchi } of floorData.diff.diffRoom.updateRooms) {
    updatedRoomSet.add(roomArchi.properties.externalId);
    if (isInSkipList(skipList, roomArchi.properties.externalId)) continue;
    const { name, attr, info } = getRoomNameAndAttr(roomArchi, diff);
    const roomNode = <SpinalNode>(
      FileSystem._objects[roomArchi.properties.spinalnodeServerId]
    );
    const roomCmd: ICmdNew = {
      pNId: floorNode.info.id.get(),
      id: roomNode?.info.id?.get() || guid(),
      type: 'room',
      name,
      info,
      attr,
    };
    roomCmds.push(roomCmd);
    roomArchi.children.forEach((nodeInfo) => {
      const roomRefCmd = getRefCmd(nodeInfo, roomCmd.id, 'roomRef', bimFileId);
      roomRefCmds.push(roomRefCmd);
    });
  }
  const proms: Promise<ICmdRefChildren>[] = [];
  for (const roomExtId in floorData.floorArchi.children) {
    if (
      Object.prototype.hasOwnProperty.call(
        floorData.floorArchi.children,
        roomExtId
      )
    ) {
      const roomArchi = floorData.floorArchi.children[roomExtId];
      if (updatedRoomSet.has(roomExtId)) continue;
      if (isInSkipList(skipList, roomExtId)) continue;
      // get realNode
      const roomNode = <SpinalNode>(
        FileSystem._objects[roomArchi.properties.spinalnodeServerId]
      );
      if (!roomNode) continue;
      proms.push(
        roomNode
          .getChildren(REFERENCE_ROOM_RELATION)
          .then((children): ICmdRefChildren => {
            return {
              children,
              roomArchi,
              roomCmd: {
                pNId: floorNode.info.id.get(),
                id: roomNode?.info.id?.get() || guid(),
                type: 'RefNode',
              } as ICmdNew,
            };
          })
      );
    }
  }

  const cmds = await Promise.all(proms);
  for (const { children, roomCmd, roomArchi } of cmds) {
    const roomRefCmds2: ICmdNew[] = [];
    const refsToRm = [];
    // check child to remove
    for (const child of children) {
      let found = false;
      for (const nodeInfo of roomArchi.children) {
        if (
          child.info.dbid.get() === nodeInfo.dbId &&
          child.info.bimFileId.get() === bimFileId
        ) {
          found = true;
          break;
        }
      }
      if (found === false) {
        refsToRm.push(child.info.externalId.get());
      }
    }

    roomArchi.children.forEach((nodeInfo) => {
      // check if it exist
      for (const child of children) {
        if (child.info.externalId.get() === nodeInfo.externalId) return;
      }
      // if not exist add to list createRef
      const roomRefCmd = getRefCmd(nodeInfo, roomCmd.id, 'roomRef', bimFileId);
      roomRefCmds2.push(roomRefCmd);
    });
    if (refsToRm.length > 0 || roomRefCmds2.length > 0) {
      roomCmds.push(roomCmd);
      if (refsToRm.length > 0) {
        roomRefCmds.push({
          pNId: roomCmd.id,
          type: 'roomRefDel',
          nIdToDel: refsToRm,
        });
      }
      if (roomRefCmds2.length > 0) {
        roomRefCmds.push(...roomRefCmds2);
      }
    }
  }
}
function getRoomName(roomArchi: IRoomArchi, diff: IDiffNodeInfoAttr): string {
  for (const infoObj of diff.diffInfo) {
    if (infoObj.label === 'name') return <string>infoObj.archiValue;
  }
  const name = <string>getNodeInfoArchiAttr(roomArchi.properties, 'name');
  const number = <string>getNodeInfoArchiAttr(roomArchi.properties, 'number');
  return number ? `${number}-${name}` : name;
}
function getRoomNameAndAttr(roomArchi: IRoomArchi, diff: IDiffNodeInfoAttr) {
  const name = getRoomName(roomArchi, diff);
  const info = {} as ICmdNewInfo;
  for (const diffInfo of diff.diffInfo) {
    info[diffInfo.label] = diffInfo.archiValue;
  }

  const attr = diff.diffAttr.map((itm) => {
    return {
      label: itm.label,
      value: itm.archiValue,
      unit: parseUnit(itm.unit),
    };
  });
  return { name, attr, info };
}
function getFloorRefCmd(
  floorData: IFloorData,
  floorNode: SpinalNode,
  bimFileId: string
): ICmdNew[] {
  const floorRefCmd: ICmdNew[] = [];
  for (const strucNodeInfo of floorData.diff.diffRef.newBimObj) {
    let name = '';
    strucNodeInfo.properties.forEach((itm) => {
      if (itm.name === 'name') name = <string>itm.value;
    });
    floorRefCmd.push({
      pNId: floorNode.info.id.get(),
      id: guid(),
      type: 'floorRef',
      name,
      info: {
        dbid: strucNodeInfo.dbId,
        externalId: strucNodeInfo.externalId,
        bimFileId,
      },
    });
  }
  return floorRefCmd;
}

function getFloorName(floorData: IFloorData): string {
  for (const infoObj of floorData.diff.diffInfo.diffInfo) {
    if (infoObj.label === 'name') return <string>infoObj.archiValue;
  }
  return <string>getNodeInfoArchiAttr(floorData.floorArchi.properties, 'name');
}

function getFloorCmdUp(
  floorData: IFloorData,
  buildingNode: SpinalNode,
  floorNode: SpinalNode
) {
  const info = {} as ICmdNewInfo;
  for (const diffInfo of floorData.diff.diffInfo.diffInfo) {
    info[diffInfo.label] = diffInfo.archiValue;
  }
  const name = getFloorName(floorData);
  const attr = floorData.diff.diffInfo.diffAttr.map((itm) => {
    return {
      label: itm.label,
      value: itm.archiValue,
      unit: parseUnit(itm.unit),
    };
  });
  const floorCmd: ICmdNew = {
    type: 'floor',
    pNId: buildingNode.info.id.get(),
    id: floorNode?.info.id?.get(),
    name,
    info,
    attr,
  };
  if (name === '') {
    Object.assign(floorCmd, { name });
  }
  return floorCmd;
}
