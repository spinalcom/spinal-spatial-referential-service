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
exports.getProjectionConfig = getProjectionConfig;
const constant_1 = require("../../constant");
const ProjectionGroupConfig_1 = require("../ProjectionItem/ProjectionGroupConfig");
const utils_1 = require("../../utils");
function getProjectionConfig(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const configNodes = yield context.getChildren(constant_1.PROJECTION_CONFIG_RELATION);
        const res = [];
        for (const configNode of configNodes) {
            yield (0, utils_1.waitGetServerId)(configNode);
            let projectionGroupConfig;
            // old config => add uid
            if (typeof configNode.info.uid === 'undefined') {
                projectionGroupConfig = new ProjectionGroupConfig_1.ProjectionGroupConfig(configNode.info.name.get(), configNode._server_id);
            }
            else {
                projectionGroupConfig = new ProjectionGroupConfig_1.ProjectionGroupConfig(configNode.info.name.get(), configNode._server_id, configNode.info.uid.get());
            }
            res.push(projectionGroupConfig);
        }
        return res;
    });
}
//# sourceMappingURL=getProjectionConfig.js.map