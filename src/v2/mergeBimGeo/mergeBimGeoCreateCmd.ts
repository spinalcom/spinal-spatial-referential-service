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

import {
  GEO_BUILDING_TYPE,
  GEO_CONTEXT_TYPE,
  GEO_FLOOR_TYPE,
} from '../../Constant';
import type { ICmdNew, ICmdNewSpace } from '../interfaces';
import { ETreeItemStatus, type ITreeItem } from './ITreeItem';
interface IGenPair {
  parent?: ITreeItem;
  item: ITreeItem;
}
export async function mergeBimGeoCreateCmd(treeItems: ITreeItem[]) {
  const cmds: ICmdNew[][] = [];
  let currentGen: IGenPair[] = treeItems.map((i) => {
    return { item: i };
  });
  const cmdsFloor: ICmdNewSpace[] = [];
  while (currentGen.length !== 0) {
    const nextGen: IGenPair[] = [];
    const cmdsGen: ICmdNew[] = [];
    for (const { item, parent } of currentGen) {
      switch (item.type) {
        case GEO_CONTEXT_TYPE:
          if (item.children.length > 0) {
            nextGen.push(
              ...item.children.map((i) => {
                return { item: i, parent: item };
              })
            );
          }
          break;
        case GEO_BUILDING_TYPE:
          cmdsGen.push(<ICmdNewSpace>{
            pNId: parent?.id,
            type: 'building',
            contextId: item.contextId,
            id: item.id,
            name: item.name,
          });
          if (item.children.length > 0) {
            nextGen.push(
              ...item.children.map((i) => {
                return { item: i, parent: item };
              })
            );
          }
          break;
        case GEO_FLOOR_TYPE:
          await mergeBimGeoHandleFloor(
            item,
            parent?.id,
            item.contextId,
            cmdsFloor,
          );
          break;
        default:
      }
    }

    if (cmdsGen.length > 0) cmds.push(cmdsGen);
    currentGen = nextGen;
  }
  if (cmdsFloor.length > 0) cmds.push(cmdsFloor);
  return cmds;
}

async function mergeBimGeoHandleFloor(
  item: ITreeItem,
  parentId: string,
  contextId: string,
  cmdsFloor: ICmdNewSpace[],
) {
  const floorParts = item.children.filter(
    (i) =>
      i.status === ETreeItemStatus.normal ||
      i.status === ETreeItemStatus.newItem
  );
  const floorCmd: ICmdNewSpace = {
    pNId: parentId,
    type: 'floor',
    contextId,
    id: item.id,
    name: item.name,
    linkedBimGeos: floorParts.map((i) => {
      return {
        contextId: i.contextId,
        floorId: i.id,
      };
    }),
  };
  cmdsFloor.push(floorCmd);
}