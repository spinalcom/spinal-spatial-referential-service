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

import { ETreeItemStatus, type ITreeItem } from './ITreeItem';

export function removeBimFloor(
  contextGeoTree: ITreeItem[],
  bimFloorItem: ITreeItem
) {
  if (bimFloorItem.status === ETreeItemStatus.newItem) {
    const getParentRec = (item) => {
      const idx = item.children.findIndex((i) => i === bimFloorItem);
      if (idx >= 0) {
        item.children.splice(idx, 1);
        bimFloorItem.inGeoContext = false;
        bimFloorItem.status = bimFloorItem.startStatus;
        for (const child of bimFloorItem.children) {
          child.inGeoContext = false;
          child.status = child.startStatus;
        }
        return item;
      }
      for (const child of item.children) {
        const res = getParentRec(child);
        if (res) return res;
      }
    };
    for (const itm of contextGeoTree) {
      if (getParentRec(itm)) return;
    }
  } else {
    bimFloorItem.inGeoContext = false;
    bimFloorItem.status = ETreeItemStatus.deleteItem;
  }
}
