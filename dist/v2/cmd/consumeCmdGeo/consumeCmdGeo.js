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
exports.consumeCmdGeo = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const getContextSpatial_1 = require("../../utils/getContextSpatial");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const consumeBatch_1 = require("../../../utils/consumeBatch");
const updateAttr_1 = require("../../utils/archi/updateAttr");
const updateInfo_1 = require("../../utils/archi/updateInfo");
const updateInfoByKey_1 = require("../../utils/archi/updateInfoByKey");
const graphservice_1 = require("../../utils/graphservice");
const waitGetServerId_1 = require("../../utils/waitGetServerId");
const getBimContextByBimFileId_1 = require("../../utils/getBimContextByBimFileId");
const constant_1 = require("../../constant");
const Constant_1 = require("../../../Constant");
function consumeCmdGeo(cmds, nodeGenerationId, contextGenerationId, callbackProg, consumeBatchSize = 20) {
    return __awaiter(this, void 0, void 0, function* () {
        const graph = (0, graphservice_1.getGraph)();
        const contextGeo = yield (0, getContextSpatial_1.getContextSpatial)(graph);
        const dico = {};
        recordDico(dico, contextGeo);
        const buildings = yield contextGeo.getChildrenInContext();
        const contexts = yield graph.getChildren();
        contexts.forEach(recordDico.bind(null, dico));
        buildings.forEach(recordDico.bind(null, dico));
        for (let index = 0; index < cmds.length; index++) {
            const cmdArr = cmds[index];
            const proms = [];
            let isFloors = false;
            for (const cmd of cmdArr) {
                if (cmd.type === 'building') {
                    proms.push(consumeNewUpdateCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.addBuilding));
                }
                else if (cmd.type === 'floor') {
                    proms.push(consumeNewUpdateCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.addFloor));
                    isFloors = true;
                }
                else if (cmd.type === 'floorRef') {
                    proms.push(consumeNewUpdateRefCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION));
                }
                else if (cmd.type === 'floorRefDel') {
                    proms.push(consumeDeleteCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION));
                }
                else if (cmd.type === 'floorRoomDel') {
                    proms.push(consumeDeleteCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.ROOM_RELATION, nodeGenerationId, contextGenerationId));
                }
                else if (cmd.type === 'room') {
                    proms.push(consumeNewUpdateCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.addRoom));
                }
                else if (cmd.type === 'roomRef') {
                    proms.push(consumeNewUpdateRefCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.REFERENCE_ROOM_RELATION));
                }
                else if (cmd.type === 'roomRefDel') {
                    proms.push(consumeDeleteCmd.bind(null, dico, cmd, spinal_env_viewer_context_geographic_service_1.REFERENCE_ROOM_RELATION));
                }
                else if (cmd.type === 'RefNode') {
                    proms.push(consumeRefNode.bind(null, dico, cmd));
                }
            }
            yield (0, consumeBatch_1.consumeBatch)(proms, isFloors ? 1 : consumeBatchSize, (idx) => {
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
exports.consumeCmdGeo = consumeCmdGeo;
function getBimContext(dico, bimFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const bimContext = dico[bimFileId];
        if (bimContext)
            return bimContext;
        dico[bimFileId] = new Promise((resolve, reject) => {
            (0, getBimContextByBimFileId_1.getBimContextByBimFileId)(bimFileId, true)
                .then((bimContext) => resolve(bimContext))
                .catch(reject);
        });
        return dico[bimFileId];
    });
}
function consumeRefNode(dico, cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spinal.SHOW_LOG_GENERATION)
            console.log('consumeRef', cmd);
        const parentNode = dico[cmd.pNId];
        if (!parentNode)
            throw new Error(`ParentId for ${cmd.type} not found.`);
        const context = dico[cmd.contextId];
        if (!context)
            throw new Error(`contextId [${cmd.contextId}] for ${cmd.type} not found.`);
        // find id in parentChildren
        const children = yield parentNode.getChildrenInContext(context);
        const child = children.find((node) => node.info.id.get() === cmd.id);
        recordDico(dico, child);
    });
}
function consumeDeleteCmd(dico, cmd, relationName, nodeGenerationId, contextGenerationId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spinal.SHOW_LOG_GENERATION)
            console.log('consumeDeleteCmd', cmd);
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
            if (nodeGenerationId) {
                const contextGeneration = (0, graphservice_1.getRealNode)(contextGenerationId);
                const nodeGeneration = (0, graphservice_1.getRealNode)(nodeGenerationId);
                const prom = nodesToDel.map((itm) => {
                    return nodeGeneration.addChildInContext(itm, constant_1.ARCHIVE_RELATION_NAME, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, contextGeneration);
                });
                yield Promise.all(prom);
            }
            yield parentNode.removeChildren(nodesToDel, relationName, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }
    });
}
function recordDico(dico, node) {
    dico[node.info.id.get()] = node;
}
function consumeNewUpdateCmd(dico, cmd, createMtd) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spinal.SHOW_LOG_GENERATION)
            console.log('consumeNewUpdateCmd', cmd);
        const parentNode = dico[cmd.pNId];
        if (!parentNode)
            throw new Error(`ParentId for ${cmd.type} not found.`);
        const context = dico[cmd.contextId];
        if (!context)
            throw new Error(`contextId [${cmd.contextId}] for ${cmd.type} not found.`);
        // find id in parentChildren
        const children = yield parentNode.getChildrenInContext(context);
        let child = children.find((node) => node.info.id.get() === cmd.id);
        if (!child) {
            // id not found => create Child
            child = yield createMtd(context, parentNode, cmd.name, cmd.id);
        }
        // update the floor with cmd!
        // update info
        if (cmd.info)
            (0, updateInfo_1.updateInfo)(child, cmd.info);
        yield (0, updateAttr_1.updateAttr)(child, cmd.attr); // update attr
        if (cmd.name)
            (0, updateInfoByKey_1.updateInfoByKey)(child, 'name', cmd.name);
        // Update linkedBimGeos
        yield handleLinkedBimGeosInfo(cmd, child, context);
        recordDico(dico, child);
        yield removeFromContextGen(child);
        yield (0, waitGetServerId_1.waitGetServerId)(child);
    });
}
function handleLinkedBimGeosInfo(cmd, floorNode, contextGeo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!cmd.linkedBimGeos) {
            return;
        }
        // update child.info.linkedBimGeos
        if (typeof floorNode.info.linkedBimGeos === 'undefined') {
            floorNode.info.add_attr('linkedBimGeos', cmd.linkedBimGeos);
        }
        else {
            const toRm = [];
            let found = false;
            for (const item of cmd.linkedBimGeos) {
                for (const itmNode of floorNode.info.linkedBimGeos) {
                    if (itmNode.contextId.get() === item.contextId &&
                        itmNode.floorId.get() === item.floorId) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    floorNode.info.linkedBimGeos.push({
                        floorId: item.floorId,
                        contextId: item.contextId,
                    });
                }
            }
            for (const item of floorNode.info.linkedBimGeos) {
                if (!cmd.linkedBimGeos.some((itm) => itm.contextId === item.contextId.get() &&
                    itm.floorId === item.floorId.get())) {
                    toRm.push(item);
                }
            }
            for (const itm of toRm) {
                const idx = floorNode.info.linkedBimGeos.indexOf_ref(itm);
                if (idx != -1)
                    floorNode.info.linkedBimGeos.splice(idx, 1);
            }
        }
        // update child node children
        const promUpRoom = updateLinkedBimGeoFloorNode(floorNode, contextGeo, cmd);
        const promUpRef = updateLinkedBimGeoFloorNodeRef(floorNode, cmd);
        yield Promise.all([promUpRoom, promUpRef]);
    });
}
function updateLinkedBimGeoFloorNode(floorNode, contextGeo, cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomNodes = yield floorNode.getChildrenInContext(contextGeo);
        if (cmd.linkedBimGeos.length === 0 && roomNodes.length > 0) {
            return floorNode.removeChildren(roomNodes, Constant_1.GEO_ROOM_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }
        const roomIdsSeen = new Set();
        for (const item of cmd.linkedBimGeos) {
            const bimContext = (0, graphservice_1.getRealNode)(item.contextId);
            if (!bimContext) {
                console.error(`Unknown linkedBimGeos contextId [${item.contextId}] for floor node ${floorNode.info.name.get()}`);
                continue;
            }
            // get floor
            const bimFloorNodes = yield bimContext.getChildrenInContext(bimContext);
            const bimFloorNode = bimFloorNodes.find((itm) => itm.info.id.get() === item.floorId);
            if (!bimFloorNode) {
                console.error(`Unknown linkedBimGeos bimFloorNode [${item.floorId}] from ${bimContext.info.name.get()} context to link to floor node ${floorNode.info.name.get()}`);
                continue;
            }
            // get rooms
            const bimRoomNodes = yield bimFloorNode.getChildrenInContext(bimContext);
            bimRoomNodes.forEach((room) => roomIdsSeen.add(room.info.id.get()));
            // get room to add
            const roomsToAdd = bimRoomNodes.filter((nodeBim) => {
                return !roomNodes.some((nodeGeo) => nodeGeo.info.id.get() === nodeBim.info.id.get());
            });
            // add room to add to floorNode
            const proms = roomsToAdd.map((roomToAdd) => floorNode.addChildInContext(roomToAdd, Constant_1.GEO_ROOM_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, contextGeo));
            yield Promise.all(proms);
        }
        const nodesToRm = roomNodes.reduce((result, nodeGeo) => {
            if (!roomIdsSeen.has(nodeGeo.info.id.get())) {
                result.push(nodeGeo);
            }
            return result;
        }, []);
        if (nodesToRm.length > 0) {
            yield floorNode.removeChildren(nodesToRm, Constant_1.GEO_ROOM_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }
    });
}
function updateLinkedBimGeoFloorNodeRef(targetFloorNode, cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        const targetFloorRefs = yield targetFloorNode.getChildren(spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION);
        // remove all if cmd.linkedBimGeos.length === 0
        if (cmd.linkedBimGeos.length === 0 && targetFloorRefs.length > 0) {
            return targetFloorNode.removeChildren(targetFloorRefs, Constant_1.GEO_ROOM_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }
        const refIdsSeen = new Set();
        for (const item of cmd.linkedBimGeos) {
            const bimContext = (0, graphservice_1.getRealNode)(item.contextId);
            if (!bimContext) {
                console.error(`Unknown linkedBimGeos contextId [${item.contextId}] for floor node ${targetFloorNode.info.name.get()}`);
                continue;
            }
            // get floor
            const bimFloorNodes = yield bimContext.getChildrenInContext(bimContext);
            const bimFloorNode = bimFloorNodes.find((itm) => itm.info.id.get() === item.floorId);
            if (!bimFloorNode) {
                console.error(`Unknown linkedBimGeos bimFloorNode [${item.floorId}] from ${bimContext.info.name.get()} context to link to floor node ${targetFloorNode.info.name.get()}`);
                continue;
            }
            // get floor refs
            const bimFloorRefNodes = yield bimFloorNode.getChildren(spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION);
            bimFloorRefNodes.forEach((ref) => refIdsSeen.add(ref.info.id.get()));
            // get floor refs to add
            const refsToAdd = bimFloorRefNodes.filter((nodeBim) => {
                return !targetFloorRefs.some((nodeGeo) => nodeGeo.info.id.get() === nodeBim.info.id.get());
            });
            // add floor refs to add to floorNode
            const proms = refsToAdd.map((refToAdd) => targetFloorNode.addChild(refToAdd, spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE));
            yield Promise.all(proms);
        }
        const nodesToRm = targetFloorRefs.reduce((result, refNode) => {
            if (!refIdsSeen.has(refNode.info.id.get())) {
                result.push(refNode);
            }
            return result;
        }, []);
        if (nodesToRm.length > 0) {
            yield targetFloorNode.removeChildren(nodesToRm, spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }
    });
}
function removeFromContextGen(roomNode) {
    return __awaiter(this, void 0, void 0, function* () {
        const parents = yield roomNode.getParents(constant_1.ARCHIVE_RELATION_NAME);
        yield Promise.all(parents.map((parent) => {
            return parent.removeChild(roomNode, constant_1.ARCHIVE_RELATION_NAME, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }));
    });
}
function createOrUpdateBimObjByBimFileId(dico, id, bimFileId, name, dbId, externalId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bimContext = yield getBimContext(dico, bimFileId);
        const bimobjs = yield bimContext.getChildren(Constant_1.GEO_EQUIPMENT_RELATION);
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
        const bimObj = new spinal_model_graph_1.SpinalNode(name, spinal_env_viewer_context_geographic_service_1.EQUIPMENT_TYPE);
        (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'name', name);
        (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'id', id);
        (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'dbid', dbId);
        (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'bimFileId', bimFileId);
        (0, updateInfoByKey_1.updateInfoByKey)(bimObj, 'externalId', externalId);
        return bimContext.addChild(bimObj, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
    });
}
function consumeNewUpdateRefCmd(dico, cmd, relationName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spinal.SHOW_LOG_GENERATION)
            console.log('consumeNewUpdateRefCmd', cmd);
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
            yield parentNode.addChild(child, relationName, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }
        yield (0, waitGetServerId_1.waitGetServerId)(child);
    });
}
//# sourceMappingURL=consumeCmdGeo.js.map