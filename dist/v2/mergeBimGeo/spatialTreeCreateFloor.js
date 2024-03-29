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
exports.spatialTreeCreateFloor = void 0;
const Constant_1 = require("../../Constant");
const utils_1 = require("../utils");
const ITreeItem_1 = require("./ITreeItem");
function spatialTreeCreateFloor(parent, name, contextId) {
    if (parent.type === Constant_1.GEO_BUILDING_TYPE)
        parent.children.push({
            name,
            contextId,
            id: (0, utils_1.guid)(),
            status: ITreeItem_1.ETreeItemStatus.newItem,
            type: Constant_1.GEO_FLOOR_TYPE,
            children: [],
        });
    else
        throw new Error('Parent Item must be an Building');
}
exports.spatialTreeCreateFloor = spatialTreeCreateFloor;
//# sourceMappingURL=spatialTreeCreateFloor.js.map