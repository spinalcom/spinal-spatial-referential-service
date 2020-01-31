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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const InvalidObjectManager_1 = require("./InvalidObjectManager");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const InvalidManager = new InvalidObjectManager_1.InvalidObjectManager();
class AbstractEntityManager {
    constructor() {
        this.invalidObjectManager = new InvalidObjectManager_1.InvalidObjectManager();
    }
    /**
     * add a new entity to the parent if the entity is not already present
     * @param contextId {string}
     * @param parentId {string}
     * @param childId {string}
     * @param relationName {string}
     * @param relationType {string}
     */
    addChild(contextId, parentId, childId, relationName, relationType) {
        return __awaiter(this, void 0, void 0, function* () {
            const parentChild = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(parentId, [relationName]);
            if (typeof parentChild !== "undefined")
                for (let i = 0; i < parentChild.length; i++) {
                    const brother = parentChild[i];
                    if (brother.id.get() === childId)
                        return brother;
                }
            return spinal_env_viewer_graph_service_1.SpinalGraphService
                .addChildInContext(parentId, childId, contextId, relationName, relationType)
                .then(node => spinal_env_viewer_graph_service_1.SpinalGraphService.getNode(node.info.id.get()));
        });
    }
    /**
     * Delete the entity
     * @param entityId {string} id of the entity
     * @returns true if the entity has been deleted false otherwise
     */
    delete(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomNode = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getNodeAsync(entityId);
            const parent = yield this.getParents(roomNode);
            if (typeof parent === "undefined")
                return false;
            const removed = yield spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(parent.info.id.get(), entityId, spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_TYPE);
            yield this.invalidObjectManager.addObject(entityId);
            return removed;
        });
    }
    addBimObject(contextId, parentId, dbId, objectName, model) {
        // @ts-ignore
        window.spinal.BimObjectService
            .addBIMObject(contextId, parentId, dbId, objectName, model);
    }
    addReferenceObject(parentId, dbId, name, model) {
        // @ts-ignore
        window.spinal.BimObjectService
            .addReferenceObject(parentId, dbId, name, model);
    }
    /**
     * Add all the attribute of $attribute to the node
     * @param node
     * @param attributes
     * @param properties
     */
    addAttribute(node, attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            let proms = [];
            let category = yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getCategoryByName(node, 'Spatial');
            if (typeof category === "undefined") {
                category = yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addCategoryAttribute(node, 'Spatial');
            }
            for (let i = 0; i < attributes.length; i++) {
                const prop = attributes[i];
                proms.push(spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addAttributeByCategory(node, category, prop.name, prop.value));
            }
            return Promise.all(proms);
        });
    }
    /**
     * Get the entity for entityId
     * @param entityId {string} id of the entity
     * @returns  the entity if found undefined otherwise
     */
    get(entityId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getNodeAsync(entityId);
    }
    getPropertyValueByName(properties, name) {
        for (let i = 0; i < properties.length; i++) {
            if (properties[i].name.toLowerCase() === name.toLowerCase())
                return properties[i].value;
        }
        return undefined;
    }
    getByExternalId(externalId, parentId, relationName) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(parentId, [relationName])
            .then(children => {
            if (typeof children === "undefined")
                return undefined;
            for (let i = 0; i < children.length; i++) {
                if (children[i].hasOwnProperty('externalId') && children[i].externalId.get() === externalId)
                    return children[i];
            }
            return undefined;
        });
    }
}
exports.AbstractEntityManager = AbstractEntityManager;
//# sourceMappingURL=AbstractEntityManager.js.map