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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeBimGeoCreateCmd = void 0;
const Constant_1 = require("../../Constant");
const utils_1 = require("../utils");
const ITreeItem_1 = require("./ITreeItem");
function mergeBimGeoCreateCmd(treeItems) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmds = [];
        let currentGen = treeItems.map((i) => {
            return { item: i };
        });
        const cmdsFloor = [];
        const cmdsRoom = [];
        const cmdsRoomDel = [];
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
                        yield mergeBimGeoHandleFloor(item, parent === null || parent === void 0 ? void 0 : parent.id, item.contextId, cmdsFloor, cmdsRoom, cmdsRoomDel);
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
        if (cmdsRoom.length > 0)
            cmds.push(cmdsRoom);
        if (cmdsRoomDel.length > 0)
            cmds.push(cmdsRoomDel);
        return cmds;
    });
}
exports.mergeBimGeoCreateCmd = mergeBimGeoCreateCmd;
function mergeBimGeoHandleFloor(item, parentId, contextId, cmdsFloor, cmdsRoom, cmdsRoomDel) {
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
        // if (item.status === ETreeItemStatus.normal) {
        //   const contextGeo: SpinalContext = getRealNode(contextId);
        //   const floorNode: SpinalNodeFloor = await getFloorNode(item, contextGeo);
        //   const roomNodes = await floorNode.getChildrenInContext(contextGeo);
        //   for (const itemChild of item.children) {
        //     const bimGeoContext = getRealNode(itemChild.contextId);
        //     const bimGeoFloorNode = await getFloorNode(itemChild, bimGeoContext);
        //     const bimGeoRoomNodes = await bimGeoFloorNode.getChildrenInContext(
        //       bimGeoContext
        //     );
        //     // const itemsToAdd: SpinalNode[] = [];
        //     // const itemsToUpdate = bimGeoRoomNodes.filter((bimGeoRoomNode) => {
        //     //   const bimGeoRoomNodeExist = roomNodes.some((roomNode) => {
        //     //     return bimGeoRoomNode === roomNode;
        //     //   });
        //     //   if (!bimGeoRoomNodeExist) itemsToAdd.push(bimGeoRoomNode);
        //     //   return bimGeoRoomNodeExist;
        //     // });
        //     const itemsToDelete = roomNodes.filter(
        //       (roomNode) =>
        //         roomNode.belongsToContext(bimGeoContext) &&
        //         bimGeoRoomNodes.some((bimGeoRoomNode) => roomNode === bimGeoRoomNode)
        //     );
        //     cmdsRoomDel.push({
        //       pNId: item.id,
        //       type: 'floorRoomDel',
        //       nIdToDel: itemsToDelete.map((i) => i.info.id.get()),
        //     });
        //     for (const bimGeoRoomNode of bimGeoRoomNodes) {
        //       cmdsRoom.push({
        //         pNId: item.id,
        //         contextId,
        //         id: bimGeoRoomNode.info.id.get(),
        //         name: bimGeoRoomNode.info.name.get(),
        //         type: 'room',
        //       });
        //     }
        //   }
        // }
    });
}
function getFloorNode(item, context) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const node = (0, utils_1.getRealNode)(item.id);
        if (node)
            return node;
        try {
            for (var _d = true, _e = __asyncValues(context.visitChildrenInContext(context)), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const child = _c;
                    if (child.info.id.get() === item.id)
                        return child;
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
//# sourceMappingURL=mergeBimGeoCreateCmd.js.map