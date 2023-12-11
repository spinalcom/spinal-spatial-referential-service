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

import type { IRoomArchi } from '../../interfaces/IGetArchi';
import type { SpinalContext } from 'spinal-model-graph';
import type { ICmdNew } from '../../interfaces/ICmdNew';
import { parseUnit } from '../../scripts/transformArchi';
import { guid } from '../../utils/guid';
import { getRefCmd } from './getRefCmd';
import { GEO_ROOM_RELATION } from '../../../Constant';

export async function getRoomCmd(
  roomArchi: IRoomArchi,
  pNId: string,
  bimFileId: string,
  roomCmds: ICmdNew[],
  roomRefCmds: ICmdNew[],
  refContext: SpinalContext,
  contextId: string
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
  const node = await getRoomFromRefByName(refContext, name);
  const id = node ? node.info.id.get() : guid();
  const roomCmd: ICmdNew = {
    pNId,
    contextId,
    id,
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
async function getRoomFromRefByName(refContext: SpinalContext, name: string) {
  const children = await refContext.getChildren(GEO_ROOM_RELATION);
  for (const child of children) {
    if (child.info.name.get() === name) return child;
  }
}
