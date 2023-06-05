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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeCmdProjection = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const utils_1 = require("../../utils");
const Constant_1 = require("../../../Constant");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const consumeBatch_1 = require("../../../utils/consumeBatch");
const lodash_throttle_1 = __importDefault(require("lodash.throttle"));
function consumeCmdProjection(cmds, nodeId, contextId, callbackProg) {
    return __awaiter(this, void 0, void 0, function* () {
        const contextGeneration = (0, utils_1.getRealNode)(contextId);
        const nodeGeneration = (0, utils_1.getRealNode)(nodeId);
        const warnNodeGen = getOrCreateGenOutNode(contextGeneration, nodeGeneration, 'warn');
        const errorNodeGen = getOrCreateGenOutNode(contextGeneration, nodeGeneration, 'error');
        const dico = {};
        const graph = (0, utils_1.getGraph)();
        const contextGeo = yield (0, utils_1.getContextSpatial)(graph);
        const cb = (0, lodash_throttle_1.default)(callbackProg, 100);
        recordDico(dico, contextGeo);
        yield contextGeo.find([
            Constant_1.GEO_SITE_RELATION,
            Constant_1.GEO_BUILDING_RELATION,
            Constant_1.GEO_FLOOR_RELATION,
            Constant_1.GEO_ROOM_RELATION,
            Constant_1.GEO_ZONE_RELATION,
        ], (node) => {
            if (node.info.type.get() === Constant_1.GEO_ROOM_TYPE) {
                recordDico(dico, node);
                return true;
            }
            return false;
        });
        if (callbackProg)
            callbackProg(10);
        const totalIteration = cmds.reduce((acc, cmd) => {
            return acc + cmd.data.length;
        }, 0);
        const proms = [];
        let totalIt = 0;
        for (let idx = 0; idx < cmds.length; idx++) {
            const cmd = cmds[idx];
            const bimContext = yield getBimContext(dico, cmd.bimFileId);
            const bimobjs = yield bimContext.getChildren(Constant_1.GEO_EQUIPMENT_RELATION);
            if (isCmdProj(cmd)) {
                proms.push(consumeCmdProj.bind(this, dico, cmd, contextGeo, () => {
                    cb((++totalIt / totalIteration) * 90 + 10);
                }, bimContext, bimobjs, warnNodeGen, contextGeneration));
            }
            else {
                proms.push(consumeCmdMissingProj.bind(this, errorNodeGen, contextGeo, cmd, bimContext, bimobjs, contextGeneration, () => {
                    cb((++totalIt / totalIteration) * 90 + 10);
                }));
            }
        }
        yield (0, consumeBatch_1.consumeBatch)(proms, 1);
    });
}
exports.consumeCmdProjection = consumeCmdProjection;
function getOrCreateGenOutNode(contextGeneration, nodeGeneration, type) {
    return __asyncGenerator(this, arguments, function* getOrCreateGenOutNode_1() {
        let resNode;
        const nodes = yield __await(nodeGeneration.getChildrenInContext(contextGeneration));
        for (const node of nodes) {
            if (type === 'warn' && node.info.name.get() === 'warn') {
                resNode = node;
            }
            else if (type === 'error' && node.info.name.get() === 'error') {
                resNode = node;
            }
        }
        if (!resNode) {
            resNode = new spinal_model_graph_1.SpinalNode(type, `GenerationContextType`);
            nodeGeneration.addChildInContext(resNode, 'hasGenerationContextType', spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, contextGeneration);
        }
        const children = yield __await(resNode.getChildrenInContext(contextGeneration));
        while (true)
            yield yield __await({ node: resNode, children });
    });
}
function consumeCmdMissingProj(errorGen, contextGeo, cmd, bimContext, bimobjs, contextGeneration, callbackProg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spinal.SHOW_LOG_GENERATION)
            console.log('consumeCmdMissingProj', cmd);
        const nodeGeneration = (yield errorGen.next()).value;
        for (const obj of cmd.data) {
            if (spinal.SHOW_LOG_GENERATION)
                console.log(' => ', obj);
            let child = nodeGeneration.children.find((node) => node.info.externalId.get() === obj.externalId);
            if (child) {
                updateBimObjInfo(child, obj.name, obj.dbid, cmd.bimFileId, obj.externalId);
            }
            else {
                child = yield createOrUpdateBimObj(bimContext, bimobjs, cmd.bimFileId, obj.name, obj.dbid, obj.externalId);
                yield nodeGeneration.node.addChildInContext(child, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, contextGeneration);
                yield updateRevitCategory(child, obj.revitCat);
            }
            yield removeOtherParents(child, contextGeo, '');
            yield removeOtherParents(child, contextGeneration, nodeGeneration.node.info.id.get());
            yield (0, utils_1.waitGetServerId)(child);
            if (callbackProg)
                callbackProg();
        }
    });
}
function consumeCmdProj(dico, cmd, contextGeo, callbackProg, bimContext, bimobjs, warnGen, contextGeneration) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spinal.SHOW_LOG_GENERATION)
            console.log('consumeCmdProj', cmd);
        const parentNode = yield getFromDico(dico, cmd.pNId);
        if (!parentNode)
            throw new Error(`ParentId for ${cmd.type} not found.`);
        const children = yield parentNode.getChildrenInContext(contextGeo);
        for (const obj of cmd.data) {
            if (spinal.SHOW_LOG_GENERATION)
                console.log(' => ', obj);
            let child = children.find((node) => node.info.externalId.get() === obj.externalId);
            if (child) {
                updateBimObjInfo(child, obj.name, obj.dbid, cmd.bimFileId, obj.externalId);
            }
            else {
                child = yield createOrUpdateBimObj(bimContext, bimobjs, cmd.bimFileId, obj.name, obj.dbid, obj.externalId);
                yield parentNode.addChildInContext(child, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, contextGeo);
            }
            yield removeOtherParents(child, contextGeo, parentNode.info.id.get());
            yield updateRevitCategory(child, obj.revitCat);
            if (obj.flagWarining) {
                const nodeGeneration = (yield warnGen.next()).value;
                let childGen = nodeGeneration.children.find((node) => node.info.externalId.get() === obj.externalId);
                if (!childGen) {
                    childGen = yield createOrUpdateBimObj(bimContext, bimobjs, cmd.bimFileId, obj.name, obj.dbid, obj.externalId);
                    yield nodeGeneration.node.addChildInContext(childGen, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, contextGeneration);
                }
                yield removeOtherParents(child, contextGeneration, nodeGeneration.node.info.id.get());
            }
            yield (0, utils_1.waitGetServerId)(child);
            if (callbackProg)
                callbackProg();
        }
    });
}
function updateRevitCategory(child, revitCat) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!revitCat)
            return;
        let cat = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getCategoryByName(child, 'default');
        if (!cat) {
            cat = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.addCategoryAttribute(child, 'default');
        }
        const attrsFromNode = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getAttributesByCategory(child, cat);
        const attrFromNode = attrsFromNode.find((itm) => itm.label.get() === 'revit_category');
        if (attrFromNode) {
            attrFromNode.value.set(revitCat);
        }
        else {
            spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategory(child, cat, 'revit_category', revitCat, '', '');
        }
    });
}
function removeOtherParents(child, contextGeo, parentNodeId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const parents = yield child.getParentsInContext(contextGeo);
        const toRm = [];
        for (const otherParent of parents) {
            if (otherParent.info.id.get() !== parentNodeId) {
                toRm.push(otherParent);
            }
        }
        for (const obj of toRm) {
            if ((_a = obj.children.LstPtr) === null || _a === void 0 ? void 0 : _a[Constant_1.GEO_EQUIPMENT_RELATION]) {
                yield obj.removeChild(child, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE);
            }
            else {
                yield obj.removeChild(child, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
            }
        }
    });
}
function recordDico(dico, node) {
    dico[node.info.id.get()] = Promise.resolve(node);
}
function getFromDico(dico, id) {
    return dico[id];
}
function isCmdProj(item) {
    return item.type === 'CmdProjection';
}
function getBimContext(dico, bimFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const bimContext = getFromDico(dico, bimFileId);
        if (bimContext)
            return bimContext;
        dico[bimFileId] = new Promise((resolve, reject) => {
            (0, utils_1.getBimContextByBimFileId)(bimFileId, true)
                .then((bimContext) => resolve(bimContext))
                .catch(reject);
        });
        return getFromDico(dico, bimFileId);
    });
}
function createOrUpdateBimObj(bimContext, bimobjs, bimFileId, name, dbid, externalId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        if (externalId) {
            for (const bimObj of bimobjs) {
                if (externalId === ((_a = bimObj.info.externalId) === null || _a === void 0 ? void 0 : _a.get())) {
                    updateBimObjInfo(bimObj, name, dbid, bimFileId, externalId);
                    return bimObj;
                }
            }
        }
        for (const bimObj of bimobjs) {
            if (dbid === ((_b = bimObj.info.dbid) === null || _b === void 0 ? void 0 : _b.get())) {
                updateBimObjInfo(bimObj, name, dbid, bimFileId, externalId);
                return bimObj;
            }
        }
        const bimObj = new spinal_model_graph_1.SpinalNode(name, spinal_env_viewer_context_geographic_service_1.EQUIPMENT_TYPE);
        updateBimObjInfo(bimObj, name, dbid, bimFileId, externalId);
        return bimContext.addChild(bimObj, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
    });
}
function updateBimObjInfo(bimObj, name, dbid, bimFileId, externalId) {
    (0, utils_1.updateInfoByKey)(bimObj, 'name', name);
    (0, utils_1.updateInfoByKey)(bimObj, 'dbid', dbid);
    (0, utils_1.updateInfoByKey)(bimObj, 'bimFileId', bimFileId);
    (0, utils_1.updateInfoByKey)(bimObj, 'externalId', externalId);
}
//# sourceMappingURL=consumeCmdProjection.js.map