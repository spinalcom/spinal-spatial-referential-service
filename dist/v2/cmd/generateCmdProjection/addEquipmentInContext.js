"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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
exports.addEquipmentInContext = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const Constant_1 = require("../../../Constant");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_models_documentation_1 = require("spinal-models-documentation");
const graphservice_1 = require("../../utils/graphservice");
const ATTRIBUT_CAT_NAME = 'default';
const CAT_NAME_RENAME = 'revit_category';
function addEquipmentInContext(equipmentInfo, contextId) {
    return __awaiter(this, void 0, void 0, function* () {
        const fail = [];
        const batchSize = 10;
        let turn = 0;
        let j = 0;
        let countOK = 0;
        while (j < equipmentInfo.length) {
            const proms = [];
            for (j = turn * batchSize; j < (turn + 1) * batchSize && j < equipmentInfo.length; j++) {
                const info = equipmentInfo[j];
                if (!info.rooms) {
                    fail.push(info);
                    continue;
                }
                for (const room of info.rooms) {
                    const bimObj = yield getProps(info.bimObjectDbId, info.bimObjectModel);
                    (0, graphservice_1.addNodeGraphService)(room);
                    proms.push(addBIMObject(contextId, room.getId().get(), info.bimObjectDbId, bimObj.name, info.bimObjectModel).then((nodeRef) => {
                        const nodeBimObject = (0, graphservice_1.getRealNode)(nodeRef.id.get());
                        return addCategoryAttribute(nodeBimObject, bimObj.properties).then(() => nodeRef);
                    }));
                }
            }
            try {
                // eslint-disable-next-line no-await-in-loop
                yield waitForFileSystem(proms);
                countOK += proms.length;
            }
            catch (obj) {
                console.log('batch fail');
                console.log('batch fail => promise', proms);
            }
            turn++;
        }
        if (fail.length > 0) {
            console.error(`${fail.length} items failed to be added in Local`, fail);
        }
        const res = {
            total: equipmentInfo.length,
            Succcess: countOK,
            failLen: fail.length,
            fail,
        };
        console.log(`addEquipmentInContext done`, res);
        return res;
    });
}
exports.addEquipmentInContext = addEquipmentInContext;
function getCategory(props) {
    for (const prop of props) {
        // {displayName: "Category", displayValue: "Revit ", displayCategory: "__category__", attributeName: "Category", type: 20}
        if (prop.attributeName === 'Category' &&
            prop.displayCategory === '__category__') {
            return prop;
        }
    }
}
function addCategoryAttribute(node, props) {
    return __awaiter(this, void 0, void 0, function* () {
        let category = yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getCategoryByName(node, ATTRIBUT_CAT_NAME);
        if (typeof category === 'undefined') {
            category = yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addCategoryAttribute(node, ATTRIBUT_CAT_NAME);
        }
        const prop = getCategory(props);
        return addAttributeByCategory(node, category, CAT_NAME_RENAME, prop.displayValue);
    });
}
function addAttributeByCategory(parentNode, category, label, value) {
    return __awaiter(this, void 0, void 0, function* () {
        if (label != undefined && value != undefined && value != '' && label != '') {
            const allAttributes = yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getAllAttributes(parentNode);
            for (let i = 0; i < allAttributes.length; i++) {
                const element = allAttributes[i];
                if (element.label.get() == label) {
                    element.value.set(value);
                    return;
                }
            }
            if (category != undefined) {
                const myChild = new spinal_models_documentation_1.SpinalAttribute(label, value);
                category.element.push(myChild);
            }
        }
    });
}
function getBimObjectParentRoom(nodeBimObject) {
    return __awaiter(this, void 0, void 0, function* () {
        const parentPtrLst = nodeBimObject.parents.getElement(Constant_1.GEO_EQUIPMENT_RELATION);
        if (!parentPtrLst)
            return [];
        const prom = [];
        for (let idx = 0; idx < parentPtrLst.length; idx++) {
            prom.push(parentPtrLst[idx].load());
        }
        const relationsParent = yield Promise.all(prom);
        const parents = yield Promise.all(relationsParent.map((item) => item.parent.load()));
        return parents.filter((item) => {
            return item.info.type.get() === Constant_1.GEO_ROOM_TYPE;
        });
    });
}
function getBimObjectParentRefenceObject(nodeBimObject) {
    return __awaiter(this, void 0, void 0, function* () {
        const parentPtrLst = nodeBimObject.parents.getElement(Constant_1.GEO_REFERENCE_RELATION);
        if (!parentPtrLst)
            return [];
        const prom = [];
        for (let idx = 0; idx < parentPtrLst.length; idx++) {
            prom.push(parentPtrLst[idx].load());
        }
        const relationsParent = yield Promise.all(prom);
        const parents = yield Promise.all(relationsParent.map((item) => item.parent.load()));
        return parents.filter((item) => {
            const type = item.info.type.get();
            return type === Constant_1.GEO_FLOOR_TYPE || type === Constant_1.GEO_ROOM_TYPE;
        });
    });
}
function removeBimObjectFromOtherRoom(parentLst, nodeRoom, bimObject) {
    return __awaiter(this, void 0, void 0, function* () {
        let found = false;
        const prom = [];
        for (const parent of parentLst) {
            if (nodeRoom === parent) {
                found = true;
                continue;
            }
            if (parent.hasRelation(Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_TYPE)) {
                prom.push(parent.removeChild(bimObject, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_TYPE));
            }
            if (parent.hasRelation(Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE)) {
                prom.push(parent.removeChild(bimObject, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE));
            }
            if (parent.hasRelation(Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE)) {
                prom.push(parent.removeChild(bimObject, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE));
            }
        }
        yield Promise.all(prom);
        return found;
    });
}
function removeBimObjectFromParentRefenceObject(parentLst, nodeRoom, bimObject) {
    return __awaiter(this, void 0, void 0, function* () {
        let found = false;
        const prom = [];
        for (const parent of parentLst) {
            if (nodeRoom === parent) {
                found = true;
                continue;
            }
            if (parent.hasRelation(Constant_1.GEO_FLOOR_RELATION, spinal_model_graph_1.SPINAL_RELATION_TYPE)) {
                prom.push(parent.removeChild(bimObject, Constant_1.GEO_FLOOR_RELATION, spinal_model_graph_1.SPINAL_RELATION_TYPE));
            }
            if (parent.hasRelation(Constant_1.GEO_FLOOR_RELATION, spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE)) {
                prom.push(parent.removeChild(bimObject, Constant_1.GEO_FLOOR_RELATION, spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE));
            }
            if (parent.hasRelation(Constant_1.GEO_FLOOR_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE)) {
                prom.push(parent.removeChild(bimObject, Constant_1.GEO_FLOOR_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE));
            }
        }
        yield Promise.all(prom);
        return found;
    });
}
function addBIMObject(contextId, roomId, dbId, bimObjName, model) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bimObject = yield window.spinal.BimObjectService.getBIMObject(dbId, model);
            if (typeof bimObject !== 'undefined') {
                const nodeBimObject = (0, graphservice_1.getRealNode)(bimObject.id.get());
                const nodeRoom = (0, graphservice_1.getRealNode)(roomId);
                // rm other room parent
                const parentLst = yield getBimObjectParentRoom(nodeBimObject);
                if (parentLst.length > 0) {
                    const found = yield removeBimObjectFromOtherRoom(parentLst, nodeRoom, nodeBimObject);
                    if (found)
                        return bimObject;
                }
                // rm ref Object parent
                const parentRefLst = yield getBimObjectParentRefenceObject(nodeBimObject);
                if (parentRefLst.length > 0) {
                    yield removeBimObjectFromParentRefenceObject(parentRefLst, nodeRoom, nodeBimObject);
                }
                const context = (0, graphservice_1.getRealNode)(contextId);
                yield nodeRoom.addChildInContext(nodeBimObject, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE, context);
                return bimObject;
            }
            const child = yield window.spinal.BimObjectService.createBIMObject(dbId, bimObjName, model);
            const nodeBimObject = (0, graphservice_1.getRealNode)(child.id.get());
            const nodeRoom = (0, graphservice_1.getRealNode)(roomId);
            const context = (0, graphservice_1.getRealNode)(contextId);
            yield nodeRoom.addChildInContext(nodeBimObject, Constant_1.GEO_EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE, context);
            return child;
        }
        catch (e) {
            console.log('Error addBIMObject', contextId, roomId, dbId, bimObjName, model);
            console.error(e);
            throw e;
        }
    });
}
function getProps(dbId, model) {
    return new Promise((resolve, reject) => {
        model.getProperties(dbId, resolve, reject);
    });
}
/**
 * Waits for the nodes to be in the FileSystem.
 * @param {Array<Promise>} promises Array of promises containing the nodes
 * @returns {Promise<any>} An empty promise
 */
function waitForFileSystem(promises) {
    return __awaiter(this, void 0, void 0, function* () {
        const nodes = yield Promise.all(promises);
        const realNodes = nodes.map((item) => {
            if (item && Object.prototype.hasOwnProperty.call(item, 'id')) {
                return (0, graphservice_1.getRealNode)(item.id.get());
            }
        });
        return new Promise((resolve) => {
            const inter = setInterval(() => {
                for (const node of realNodes) {
                    if (node &&
                        typeof spinal_core_connectorjs_1.FileSystem._objects[node._server_id] === 'undefined') {
                        return;
                    }
                }
                clearInterval(inter);
                resolve(nodes);
            }, 500);
        });
    });
}
//# sourceMappingURL=addEquipmentInContext.js.map