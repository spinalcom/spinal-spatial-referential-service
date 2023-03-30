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
exports.getBimFileByBimFileId = exports.handleCmd = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_model_graph_2 = require("spinal-model-graph");
const getContextSpatial_1 = require("../getContextSpatial");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const consumeBatch_1 = require("../../utils/consumeBatch");
const updateAttr_1 = require("../utils/updateAttr");
const updateInfo_1 = require("../utils/updateInfo");
const updateInfoByKey_1 = require("../utils/updateInfoByKey");
const graphservice_1 = require("../utils/graphservice");
const waitGetServerId_1 = require("../utils/waitGetServerId");
const getBimContextByBimFileId_1 = require("../utils/getBimContextByBimFileId");
const Constant_1 = require("../../Constant");
function handleCmd(cmds, name, callbackProg) {
    return __awaiter(this, void 0, void 0, function* () {
        const graph = (0, graphservice_1.getGraph)();
        const contextGeo = yield (0, getContextSpatial_1.getContextSpatial)(graph);
        const dico = {};
        recordDico(dico, contextGeo);
        const buildings = yield contextGeo.getChildrenInContext();
        buildings.forEach(recordDico.bind(null, dico));
        for (let index = 0; index < cmds.length; index++) {
            const cmdArr = cmds[index];
            const proms = [];
            for (const cmd of cmdArr) {
                if (cmd.type === 'floor') {
                    proms.push(handleNewUpdateCmd.bind(null, dico, cmd, contextGeo, spinal_env_viewer_context_geographic_service_1.addFloor));
                }
                else if (cmd.type === 'floorRef') {
                    proms.push(handleNewUpdateRefCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION));
                }
                else if (cmd.type === 'floorRefDel') {
                    proms.push(handleDeleteCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION));
                }
                else if (cmd.type === 'floorRoomDel') {
                    proms.push(handleDeleteCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.ROOM_RELATION, name));
                }
                else if (cmd.type === 'room') {
                    proms.push(handleNewUpdateCmd.bind(null, dico, cmd, contextGeo, spinal_env_viewer_context_geographic_service_1.addRoom));
                }
                else if (cmd.type === 'roomRef') {
                    proms.push(handleNewUpdateRefCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.REFERENCE_ROOM_RELATION));
                }
                else if (cmd.type === 'roomRefDel') {
                    proms.push(handleDeleteCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.REFERENCE_ROOM_RELATION));
                }
                else if (cmd.type === 'RefNode') {
                    proms.push(handleRefNode.bind(null, dico, cmd, contextGeo));
                }
            }
            yield (0, consumeBatch_1.consumeBatch)(proms, 1, (idx) => {
                try {
                    if (callbackProg)
                        callbackProg(index, idx);
                }
                catch (error) {
                    console.error(error);
                }
            });
        }
    });
}
exports.handleCmd = handleCmd;
function getBimContext(dico, bimFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        let bimContext = dico[bimFileId];
        if (bimContext)
            return bimContext;
        bimContext = yield (0, getBimContextByBimFileId_1.getBimContextByBimFileId)(bimFileId, true);
        dico[bimFileId] = bimContext;
        return bimContext;
    });
}
// async function getBimObject(
//   cmd: ICmdNew,
//   bimContext: SpinalNode
// ): Promise<SpinalNode> {
//   const childrenBim = await bimContext.getChildren('hasBimObject');
//   for (const child of childrenBim) {
//     if (cmd.info.dbId === child.info.dbid.get()) return child;
//   }
// }
function handleRefNode(dico, cmd, contextGeo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spinal.SHOW_LOG_GENERATION)
            console.log('handleRef', cmd);
        const parentNode = dico[cmd.pNId];
        if (!parentNode)
            throw new Error(`ParentId for ${cmd.type} not found.`);
        // find id in parentChildren
        const children = yield parentNode.getChildrenInContext(contextGeo);
        const child = children.find((node) => node.info.id.get() === cmd.id);
        recordDico(dico, child);
    });
}
function handleDeleteCmd(dico, cmd, relationName, archiveName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spinal.SHOW_LOG_GENERATION)
            console.log('handleDeleteCmd', cmd);
        const parentNode = dico[cmd.pNId];
        if (!parentNode)
            throw new Error(`ParentId for ${cmd.type} not found.`);
        const childrenNode = yield parentNode.getChildren(relationName);
        const nodesToDel = [];
        for (const id of cmd.nIdToDel) {
            const refChild = childrenNode.find((itm) => itm.info.id.get() === id);
            if (refChild)
                nodesToDel.push(refChild);
        }
        if (nodesToDel.length > 0) {
            yield parentNode.removeChildren(nodesToDel, relationName, spinal_model_graph_2.SPINAL_RELATION_PTR_LST_TYPE);
            if (archiveName) {
                const { context, archive } = yield getOrCreateArchive(archiveName);
                const prom = nodesToDel.map((itm) => {
                    return archive.addChildInContext(itm, Constant_1.ARCHIVE_RELATION_NAME, spinal_model_graph_2.SPINAL_RELATION_PTR_LST_TYPE, context);
                });
                yield Promise.all(prom);
            }
        }
    });
}
function getOrCreateArchive(archiveName) {
    return __awaiter(this, void 0, void 0, function* () {
        const graph = (0, graphservice_1.getGraph)();
        let context = yield graph.getContext(Constant_1.ARCHIVE_CONTEXT_NAME);
        if (!context)
            context = new spinal_model_graph_1.SpinalContext(Constant_1.ARCHIVE_CONTEXT_NAME, Constant_1.ARCHIVE_CONTEXT_TYPE);
        yield graph.addContext(context);
        const children = yield context.getChildrenInContext(context);
        for (const child of children) {
            if (child.info.name.get() === archiveName) {
                return {
                    context,
                    archive: child,
                };
            }
        }
        const archive = new spinal_model_graph_1.SpinalNode(archiveName, Constant_1.ARCHIVE_GROUPE_TYPE);
        yield context.addChildInContext(archive, Constant_1.ARCHIVE_GROUPE_REL, spinal_model_graph_2.SPINAL_RELATION_PTR_LST_TYPE, context);
        return { context, archive };
    });
}
function recordDico(dico, node) {
    dico[node.info.id.get()] = node;
}
function handleNewUpdateCmd(dico, cmd, contextGeo, createMtd) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spinal.SHOW_LOG_GENERATION)
            console.log('handleNewUpdateCmd', cmd);
        const parentNode = dico[cmd.pNId];
        if (!parentNode)
            throw new Error(`ParentId for ${cmd.type} not found.`);
        // find id in parentChildren
        const children = yield parentNode.getChildrenInContext(contextGeo);
        let child = children.find((node) => node.info.id.get() === cmd.id);
        if (!child) {
            // id not found => create Child
            child = yield createMtd(contextGeo, parentNode, cmd.name);
            if (cmd.id)
                (0, updateInfoByKey_1.updateInfoByKey)(child, 'id', cmd.id);
        }
        // update the floor with cmd!
        // update info
        (0, updateInfo_1.updateInfo)(child, cmd.info);
        yield (0, updateAttr_1.updateAttr)(child, cmd.attr); // update attr
        if (cmd.name)
            (0, updateInfoByKey_1.updateInfoByKey)(child, 'name', cmd.name);
        recordDico(dico, child);
        yield (0, waitGetServerId_1.waitGetServerId)(child);
    });
}
function getBimFileByBimFileId(bimFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const bimFile = (0, graphservice_1.getRealNode)(bimFileId);
        if (bimFile)
            return bimFile;
        const graph = (0, graphservice_1.getGraph)();
        const context = yield graph.getContext('BimFileContext');
        if (!context)
            throw new Error('BimFileContext not found in graph');
        const child = yield context.getChild((node) => node.info.id.get() === bimFileId, 'hasBimFile', spinal_model_graph_2.SPINAL_RELATION_PTR_LST_TYPE);
        if (child)
            return child;
        throw new Error(`BimFileId [${bimFileId}] not found`);
    });
}
exports.getBimFileByBimFileId = getBimFileByBimFileId;
function createOrUpdateBimObjByBimFileId(dico, id, bimFileId, name, dbId, externalId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const bimContext = yield getBimContext(dico, bimFileId);
        const bimobjs = yield bimContext.getChildren('hasBimObject');
        if (externalId) {
            for (const bimObj of bimobjs) {
                if (externalId === ((_a = bimObj.info.externalId) === null || _a === void 0 ? void 0 : _a.get())) {
                    (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'name', name);
                    (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'dbid', dbId);
                    (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'bimFileId', bimFileId);
                    (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'externalId', externalId);
                    return bimObj;
                }
            }
        }
        for (const bimObj of bimobjs) {
            if (dbId === ((_b = bimObj.info.dbid) === null || _b === void 0 ? void 0 : _b.get())) {
                (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'name', name);
                (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'dbid', dbId);
                (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'bimFileId', bimFileId);
                (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'externalId', externalId);
                return bimObj;
            }
        }
        const bimObj = new spinal_model_graph_1.SpinalNode(name, 'BIMObject');
        (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'name', name);
        (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'id', id);
        (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'dbid', dbId);
        (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'bimFileId', bimFileId);
        (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'externalId', externalId);
        return bimContext.addChild(bimObj, 'hasBimObject', spinal_model_graph_2.SPINAL_RELATION_PTR_LST_TYPE);
    });
}
function handleNewUpdateRefCmd(dico, cmd, relationName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spinal.SHOW_LOG_GENERATION)
            console.log('handleNewUpdateRefCmd', cmd);
        const parentNode = dico[cmd.pNId];
        if (!parentNode)
            throw new Error(`ParentId for ${cmd.type} not found.`);
        // find id in parentChildren
        const children = yield parentNode.getChildren(relationName);
        let child = children.find((node) => node.info.id.get() === cmd.id);
        if (!child) {
            // id not found => create Child
            child = yield createOrUpdateBimObjByBimFileId(dico, cmd.id, cmd.info.bimFileId, cmd.name, cmd.info.dbid, cmd.info.externalId);
            for (const c of children) {
                if (c.info.id.get() === child.info.id.get())
                    return;
            }
            yield parentNode.addChild(child, relationName, spinal_model_graph_2.SPINAL_RELATION_PTR_LST_TYPE);
        }
        yield (0, waitGetServerId_1.waitGetServerId)(child);
    });
}
//# sourceMappingURL=handleCmd.js.map