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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeBimGeoCreateCmd = mergeBimGeoCreateCmd;
const Constant_1 = require("../../Constant");
const ITreeItem_1 = require("./ITreeItem");
function mergeBimGeoCreateCmd(treeItems) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmds = [];
        let currentGen = treeItems.map((i) => {
            return { item: i };
        });
        const cmdsFloor = [];
        while (currentGen.length !== 0) {
            const nextGen = [];
            const cmdsGen = [];
            for (const { item, parent } of currentGen) {
                switch (item.type) {
                    case Constant_1.GEO_CONTEXT_TYPE:
                        if (item.children.length > 0) {
                            nextGen.push(...item.children.map((i) => {
                                return { item: i, parent: item };
                            }));
                        }
                        break;
                    case Constant_1.GEO_BUILDING_TYPE:
                        cmdsGen.push({
                            pNId: parent === null || parent === void 0 ? void 0 : parent.id,
                            type: 'building',
                            contextId: item.contextId,
                            id: item.id,
                            name: item.name,
                        });
                        if (item.children.length > 0) {
                            nextGen.push(...item.children.map((i) => {
                                return { item: i, parent: item };
                            }));
                        }
                        break;
                    case Constant_1.GEO_FLOOR_TYPE:
                        yield mergeBimGeoHandleFloor(item, parent === null || parent === void 0 ? void 0 : parent.id, item.contextId, cmdsFloor);
                        break;
                    default:
                }
            }
            if (cmdsGen.length > 0)
                cmds.push(cmdsGen);
            currentGen = nextGen;
        }
        if (cmdsFloor.length > 0)
            cmds.push(cmdsFloor);
        return cmds;
    });
}
function mergeBimGeoHandleFloor(item, parentId, contextId, cmdsFloor) {
    return __awaiter(this, void 0, void 0, function* () {
        const floorParts = item.children.filter((i) => i.status === ITreeItem_1.ETreeItemStatus.normal ||
            i.status === ITreeItem_1.ETreeItemStatus.newItem);
        const floorCmd = {
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
    });
}
//# sourceMappingURL=mergeBimGeoCreateCmd.js.map