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
exports.loadConfig = loadConfig;
const spinal_model_graph_1 = require("spinal-model-graph");
const SpatialConfig_1 = require("../../models/SpatialConfig");
function loadConfig(graph) {
    return __awaiter(this, void 0, void 0, function* () {
        let configContext = yield graph.getContext('.config');
        if (typeof configContext === 'undefined') {
            configContext = new spinal_model_graph_1.SpinalContext('.config', 'system configuration', undefined);
            graph.addContext(configContext);
        }
        const children = yield configContext.getChildren(['hasConfig']);
        let config;
        for (let i = 0; i < children.length; i++) {
            if (children[i].info.type.get() === 'SpatialConfig') {
                config = children[i];
                break;
            }
        }
        if (typeof config === 'undefined') {
            // create default config
            config = new spinal_model_graph_1.SpinalNode('spatial config', 'SpatialConfig', new SpatialConfig_1.SpatialConfig());
            yield configContext.addChild(config, 'hasConfig', spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }
        return config.element.load();
    });
}
//# sourceMappingURL=loadConfig.js.map