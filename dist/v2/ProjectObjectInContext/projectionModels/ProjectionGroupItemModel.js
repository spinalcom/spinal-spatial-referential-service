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
exports.ProjectionGroupItemModel = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const utils_1 = require("../../utils");
const getExternalIdMapping_1 = require("../../utils/getExternalIdMapping");
const getBimFileByBimFileId_1 = require("../../utils/getBimFileByBimFileId");
class ProjectionGroupItemModel extends spinal_core_connectorjs_1.Model {
    constructor(item) {
        super();
        if (spinal_core_connectorjs_1.FileSystem._sig_server === false)
            return;
        this.add_attr('bimFileId', (0, utils_1.getBimFileIdByModelId)(item.modelId));
        this.add_attr('uid', item.uid);
    }
    update(item) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bimFileId.set((0, utils_1.getBimFileIdByModelId)(item.modelId));
            this.uid.set(item.uid);
            const model = (0, utils_1.getModelByModelId)(item.modelId);
            const tree = model.getInstanceTree();
            const children = (0, utils_1.getDbIdChildren)(tree, item.dbId);
            if (children.length > 0) {
                const path = yield (0, utils_1.getPropPath)(item.dbId, model);
                if (typeof this.path === 'undefined') {
                    this.add_attr('path', path);
                }
                else {
                    this.path.set(path);
                }
            }
            else {
                if (typeof this.externalId === 'undefined') {
                    this.add_attr('externalId', item.externalId);
                }
                else {
                    this.externalId.set(item.externalId);
                }
            }
            return this;
        });
    }
    toUxModel() {
        return __awaiter(this, void 0, void 0, function* () {
            const model = (0, utils_1.getModelByBimFileIdLoaded)(this.bimFileId.get());
            if (!model) {
                try {
                    const bimFile = yield (0, getBimFileByBimFileId_1.getBimFileByBimFileId)(this.bimFileId.get());
                    throw new Error(`Model [${bimFile.info.name.get()}] not loaded for bimFileId : ${this.bimFileId.get()}`);
                }
                catch (error) {
                    console.error(error);
                    throw error;
                }
            }
            if (typeof this.path !== 'undefined') {
                const path = this.path.get();
                const props = yield (0, utils_1.getPropItemFromPropPath)(path, model);
                if (!props) {
                    throw new Error(`ProjectionGroupItemModel [${this.uid.get()}] no item found for path : ${path}`);
                }
                return {
                    modelId: model.id,
                    dbid: props.dbId,
                };
            }
            else {
                const extMap = yield (0, getExternalIdMapping_1.getExternalIdMapping)(model);
                const dbid = extMap[this.externalId.get()];
                if (!dbid) {
                    throw new Error(`ProjectionGroupItemModel [${this.uid.get()}] skiped - no item found for externalId : ${this.externalId.get()}`);
                }
                return {
                    modelId: model.id,
                    dbid: dbid,
                };
            }
        });
    }
}
exports.ProjectionGroupItemModel = ProjectionGroupItemModel;
spinal_core_connectorjs_1.spinalCore.register_models(ProjectionGroupItemModel);
//# sourceMappingURL=ProjectionGroupItemModel.js.map