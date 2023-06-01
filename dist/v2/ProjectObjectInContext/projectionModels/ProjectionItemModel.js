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
exports.ProjectionItemModel = void 0;
const ProjectionItem_1 = require("../ProjectionItem/ProjectionItem");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const utils_1 = require("../../utils");
const ProjectionOffsetModel_1 = require("./ProjectionOffsetModel");
const getExternalIdMapping_1 = require("../../utils/getExternalIdMapping");
class ProjectionItemModel extends spinal_core_connectorjs_1.Model {
    constructor(projectionItem) {
        super();
        if (spinal_core_connectorjs_1.FileSystem._sig_server === false)
            return;
        this.add_attr('uid', projectionItem.uid);
        this.add_attr('bimFileId', (0, utils_1.getBimFileIdByModelId)(projectionItem.modelId));
        this.add_attr('offset', new ProjectionOffsetModel_1.ProjectionOffsetModel(projectionItem.offset));
    }
    update(projectionItem) {
        return __awaiter(this, void 0, void 0, function* () {
            this.uid.set(projectionItem.uid);
            this.bimFileId.set((0, utils_1.getBimFileIdByModelId)(projectionItem.modelId));
            this.offset.update(projectionItem.offset);
            const model = (0, utils_1.getModelByModelId)(projectionItem.modelId);
            const tree = model.getInstanceTree();
            const children = (0, utils_1.getDbIdChildren)(tree, projectionItem.dbId);
            if (children.length > 0) {
                const path = yield (0, utils_1.getPropPath)(projectionItem.dbId, model);
                if (typeof this.path === 'undefined') {
                    this.add_attr('path', path);
                }
                else {
                    this.path.set(path);
                }
            }
            else {
                if (typeof this.externalId === 'undefined') {
                    this.add_attr('externalId', projectionItem.externalId);
                }
                else {
                    this.externalId.set(projectionItem.externalId);
                }
            }
            return this;
        });
    }
    toUxModel() {
        return __awaiter(this, void 0, void 0, function* () {
            const model = (0, utils_1.getModelByBimFileIdLoaded)(this.bimFileId.get());
            let projectionItem;
            if (typeof this.path !== 'undefined') {
                const path = this.path.get();
                const props = yield (0, utils_1.getPropItemFromPropPath)(path, model);
                if (!props) {
                    console.error(`projectionItemModel [${this.uid.get()}] no item found for path : ${path}`);
                    return;
                }
                projectionItem = new ProjectionItem_1.ProjectionItem(props.name, model.id, props.dbId, props.properties, props.externalId);
            }
            else {
                const extMap = yield (0, getExternalIdMapping_1.getExternalIdMapping)(model);
                const dbid = extMap[this.externalId.get()];
                if (!dbid) {
                    console.warn(`projectionItemModel [${this.uid.get()}] skiped - no item found for externalId : ${this.externalId.get()}`);
                    return;
                }
                const props = yield (0, utils_1.getBulkProperties)(model, [dbid]);
                projectionItem = new ProjectionItem_1.ProjectionItem(props[0].name, model.id, dbid, props[0].properties, props[0].externalId);
            }
            projectionItem.uid = this.uid.get();
            projectionItem.offset = this.offset.get();
            return projectionItem;
        });
    }
}
exports.ProjectionItemModel = ProjectionItemModel;
spinal_core_connectorjs_1.spinalCore.register_models(ProjectionItemModel);
//# sourceMappingURL=ProjectionItemModel.js.map