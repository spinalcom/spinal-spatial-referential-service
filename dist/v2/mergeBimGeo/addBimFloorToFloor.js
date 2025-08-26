"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBimFloorToFloor = addBimFloorToFloor;
const ITreeItem_1 = require("./ITreeItem");
const Constant_1 = require("../../Constant");
const constant_1 = require("../constant");
function addBimFloorToFloor(selectedItem, bimFloorItem) {
    if (selectedItem.type === Constant_1.GEO_FLOOR_TYPE &&
        bimFloorItem.type === constant_1.BIM_GEO_FLOOR_PART_TYPE) {
        bimFloorItem.inGeoContext = true;
        if (selectedItem.children.some((itm) => itm.contextId === bimFloorItem.contextId && itm.id === bimFloorItem.id)) {
            bimFloorItem.status = bimFloorItem.startStatus;
        }
        else {
            selectedItem.children.push(bimFloorItem);
            bimFloorItem.status = ITreeItem_1.ETreeItemStatus.newItem;
        }
    }
}
//# sourceMappingURL=addBimFloorToFloor.js.map