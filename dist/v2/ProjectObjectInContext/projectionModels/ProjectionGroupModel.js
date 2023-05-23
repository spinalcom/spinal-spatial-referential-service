"use strict";
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
exports.ProjectionGroupModel = void 0;
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
const ProjectionGroup_1 = require("../ProjectionItem/ProjectionGroup");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const ProjectionOffsetModel_1 = require("./ProjectionOffsetModel");
const ProjectionGroupItemModel_1 = require("./ProjectionGroupItemModel");
class ProjectionGroupModel extends spinal_core_connectorjs_1.Model {
    constructor(projectionGroup) {
        super();
        if (spinal_core_connectorjs_1.FileSystem._sig_server === false)
            return;
        this.add_attr('name', projectionGroup.name);
        this.add_attr('uid', projectionGroup.uid);
        this.add_attr('offset', new ProjectionOffsetModel_1.ProjectionOffsetModel(projectionGroup.offset));
        this.add_attr('data', []);
    }
    updateData(projectionGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            const toDel = [];
            for (let idx = 0; idx < this.data.length; idx++) {
                const projItemModel = this.data[idx];
                const item = projectionGroup.computedData.find((itm) => {
                    return itm.uid === projItemModel.uid.get();
                });
                if (item) {
                    promises.push(projItemModel.update(item));
                }
                else {
                    toDel.push(projItemModel);
                }
            }
            for (const itm of toDel) {
                this.data.remove_ref(itm);
            }
            // add
            for (const data of projectionGroup.computedData) {
                const item = this.data.detect((itm) => {
                    return itm.uid.get() === data.uid;
                });
                if (!item) {
                    const mod = new ProjectionGroupItemModel_1.ProjectionGroupItemModel(data);
                    promises.push(mod.update(data));
                    this.data.push(mod);
                }
            }
            yield Promise.all(promises);
        });
    }
    update(projectionGroup) {
        this.name.set(projectionGroup.name);
        this.uid.set(projectionGroup.uid);
        this.offset.update(projectionGroup.offset);
        return this.updateData(projectionGroup);
    }
    toUxModel() {
        return __awaiter(this, void 0, void 0, function* () {
            const projectionGroup = new ProjectionGroup_1.ProjectionGroup(this.name.get());
            projectionGroup.offset = this.offset.get();
            projectionGroup.uid = this.uid.get();
            const promises = [];
            for (const data of this.data) {
                promises.push(data.toUxModel());
            }
            const data = yield Promise.all(promises);
            for (const { modelId, dbid } of data) {
                const obj = projectionGroup.data.find((itm) => itm.modelId === modelId);
                if (obj)
                    obj.selection.push(dbid);
                else
                    projectionGroup.data.push({ modelId, selection: [dbid] });
            }
            yield projectionGroup.updateComputed();
            return projectionGroup;
        });
    }
}
exports.ProjectionGroupModel = ProjectionGroupModel;
spinal_core_connectorjs_1.spinalCore.register_models(ProjectionGroupModel);
//# sourceMappingURL=ProjectionGroupModel.js.map