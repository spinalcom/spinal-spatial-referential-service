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
  ICmdNewDelete,
  ICmdNewInfo,
  ICmdNewRef,
  ICmdNewRefNode,
  ICmdNewSpace,
} from '../../interfaces/ICmdNew';
import { IDiffNodeInfoAttr, IRoomArchi } from '../../interfaces/IGetArchi';
import { isInSkipList } from '../../utils/archi/isInSkipList';
import { getRoomCmd } from './getRoomCmd';
import { getRefCmd } from './getRefCmd';
import { parseUnit } from '../../scripts/transformArchi';
import { guid } from '../../utils/guid';
import { getNodeInfoArchiAttr } from '../../utils/archi/getNodeInfoArchiAttr';
import { serverIdArrToNodeIdArr } from '../../utils/archi/serverIdArrToNodeIdArr';
import { REFERENCE_ROOM_RELATION } from 'spinal-env-viewer-context-geographic-service';
import { getOrLoadModel } from '../../utils/getOrLoadModel';
`
`;
type ICmdRefChildren = {
  children: SpinalNode[];
  roomCmd: ICmdNewRefNode;
  roomArchi: IRoomArchi;
};

export async function handleFloorUpdate(
  floorData: IFloorData,
  parentNodeId: string,
  skipList: ISkipItem[],
  bimFileId: string,
  refContext: SpinalContext,
  contextId: string,
  floors: ICmdNewSpace[],
  floorRefs: ICmdNewRef[],
  roomCmds: (ICmdNewSpace | ICmdNewRefNode)[],
  roomRefCmds: ICmdNewRef[],
  itemDeletes: ICmdNewDelete[]
) {
  const floorNode = <SpinalNode>(
    await getOrLoadModel(floorData.floorArchi.properties.spinalnodeServerId)
  );
  const floorCmd = getFloorCmdUp(floorData, parentNodeId, floorNode, contextId);
  floors.push(floorCmd);

  if (floorData.diff.diffRef.delBimObj.length > 0) {
    const delBimObj: ICmdNewDelete = {
      pNId: floorNode.info.id.get(),
      type: 'floorRefDel',
      nIdToDel: serverIdArrToNodeIdArr(floorData.diff.diffRef.delBimObj),
    };
    itemDeletes.push(delBimObj);
  }
  const roomDelServerId = floorData.diff.diffRoom.delRooms.filter(
    (itm) => !isInSkipList(skipList, itm)
  );
  if (roomDelServerId.length > 0) {
    const floorRoomDel: ICmdNewDelete = {
      pNId: floorNode.info.id.get(),
      type: 'floorRoomDel',
      nIdToDel: serverIdArrToNodeIdArr(roomDelServerId),
    };
    itemDeletes.push(floorRoomDel);
  }

  getFloorRefCmd(floorData, floorNode, bimFileId, floorRefs);
  const promRooms = floorData.diff.diffRoom.newRooms.map((roomArchi) => {
    if (!isInSkipList(skipList, roomArchi.properties.externalId))
      return getRoomCmd(
        roomArchi,
        floorNode.info.id.get(),
        bimFileId,
        roomCmds,
        roomRefCmds,
        refContext,
        contextId
      );
    return Promise.resolve();
  });
  await Promise.all(promRooms);
  await getRoomCmdUp(
    floorData,
    floorNode,
    roomCmds,
    bimFileId,
    roomRefCmds,
    skipList,
    contextId,
    itemDeletes
  );
}

async function getRoomCmdUp(
  floorData: IFloorData,
  floorNode: SpinalNode,
  roomCmds: (ICmdNewSpace | ICmdNewRefNode)[],
  bimFileId: string,
  roomRefCmds: ICmdNewRef[],
  skipList: ISkipItem[],
  contextId: string,
  itemDeletes: ICmdNewDelete[]
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
      await getOrLoadModel(roomArchi.properties.spinalnodeServerId)
    );
    const roomCmd: ICmdNewSpace = {
      pNId: floorNode.info.id.get(),
      id: roomNode?.info.id?.get() || guid(),
      type: 'room',
      contextId,
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
        await getOrLoadModel(roomArchi.properties.spinalnodeServerId)
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
                contextId,
                pNId: floorNode.info.id.get(),
                id: roomNode?.info.id?.get() || guid(),
                type: 'RefNode',
              } as ICmdNewRefNode,
            };
          })
      );
    }
  }

  const cmds = await Promise.all(proms);
  for (const { children, roomCmd, roomArchi } of cmds) {
    // const roomRefCmds2: ICmdNewRef[] = [];
    const refsToRm: string[] = [];
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
    let needUpdate = false;
    roomArchi.children.forEach((nodeInfo) => {
      // check if it exist => skip
      for (const child of children) {
        if (child.info.externalId.get() === nodeInfo.externalId) return;
      }
      // if not exist add to list createRef
      const roomRefCmd = getRefCmd(nodeInfo, roomCmd.id, 'roomRef', bimFileId);
      roomRefCmds.push(roomRefCmd);
      needUpdate = true;
    });
    if (refsToRm.length > 0 || needUpdate) {
      let needPushRefNode = false;
      for (const room of roomCmds) {
        if (room.id === roomCmd.id) {
          needPushRefNode = true;
          break;
        }
      }
      if (needPushRefNode) roomCmds.push(roomCmd);
      if (refsToRm.length > 0) {
        itemDeletes.push({
          pNId: roomCmd.id,
          type: 'roomRefDel',
          nIdToDel: refsToRm,
        });
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
  bimFileId: string,
  floorRefCmd: ICmdNewRef[]
) {
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
}

function getFloorName(floorData: IFloorData): string {
  for (const infoObj of floorData.diff.diffInfo.diffInfo) {
    if (infoObj.label === 'name') return <string>infoObj.archiValue;
  }
  return <string>getNodeInfoArchiAttr(floorData.floorArchi.properties, 'name');
}

function getFloorCmdUp(
  floorData: IFloorData,
  parentNodeId: string,
  floorNode: SpinalNode,
  contextId: string
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
  const floorCmd: ICmdNewSpace = {
    type: 'floor',
    pNId: parentNodeId,
    id: floorNode?.info.id?.get(),
    contextId,
    name,
    info,
    attr,
  };
  if (name === '') {
    Object.assign(floorCmd, { name });
  }
  return floorCmd;
}
