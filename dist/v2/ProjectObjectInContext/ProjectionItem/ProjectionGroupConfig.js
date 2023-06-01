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
exports.ProjectionGroupConfig = void 0;
const isProjectionGroup_1 = require("../../utils/projection/isProjectionGroup");
const getConfigFromContext_1 = require("../projectionConfig/getConfigFromContext");
const createConfigNode_1 = require("../projectionConfig/createConfigNode");
const removeConfigFromContext_1 = require("../projectionConfig/removeConfigFromContext");
const ProjectionGroupModel_1 = require("../projectionModels/ProjectionGroupModel");
const ProjectionItemModel_1 = require("../projectionModels/ProjectionItemModel");
class ProjectionGroupConfig {
    constructor(name, uid = `${Date.now()}-${Math.round(Math.random() * 10000)}-${Math.round(Math.random() * 10000)}`) {
        this.data = [];
        this.progress = 100;
        this.name = name;
        this.uid = uid;
    }
    countChild() {
        let counter = 0;
        for (const itm of this.data) {
            if ((0, isProjectionGroup_1.isProjectionGroup)(itm)) {
                counter += itm.computedData.length;
            }
            else {
                counter += 1;
            }
        }
        return counter;
    }
    removeFromContext(context) {
        return (0, removeConfigFromContext_1.removeConfigFromContext)(context, this.uid);
    }
    saveToContext(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let projectLst = yield (0, getConfigFromContext_1.getConfigFromContext)(context, this, true);
            if (!projectLst)
                projectLst = yield (0, createConfigNode_1.createConfigNode)(context, this);
            const promises = [];
            for (const data of this.data) {
                const itmInModel = projectLst.detect((itm) => itm.uid.get() === data.uid);
                if (itmInModel)
                    promises.push(itmInModel.update(data));
                else {
                    if ((0, isProjectionGroup_1.isProjectionGroup)(data)) {
                        const mod = new ProjectionGroupModel_1.ProjectionGroupModel(data);
                        promises.push(mod.update(data));
                    }
                    else {
                        const mod = new ProjectionItemModel_1.ProjectionItemModel(data);
                        promises.push(mod.update(data));
                    }
                }
            }
            const res = yield Promise.all(promises);
            let change = false;
            for (let idx = 0; idx < res.length; idx++) {
                if (res[idx] !== projectLst[idx])
                    change = true;
            }
            if (change) {
                while (projectLst.length > 0)
                    projectLst.pop();
                for (let idx = 0; idx < res.length; idx++) {
                    projectLst.push(res[idx]);
                }
            }
            else {
                projectLst.trim(res.length);
            }
        });
    }
}
exports.ProjectionGroupConfig = ProjectionGroupConfig;
//# sourceMappingURL=ProjectionGroupConfig.js.map