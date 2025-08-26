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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpatialConfig = void 0;
const spinal_core_connectorjs_type_1 = __importStar(require("spinal-core-connectorjs_type"));
const CONTEXT_NAME = 'spatial';
const DEFAULT_CONFIG_NAME = 'default';
class SpatialConfig extends spinal_core_connectorjs_type_1.Model {
    constructor() {
        super();
        this.add_attr({
            data: [
                {
                    configName: DEFAULT_CONFIG_NAME,
                    contextName: CONTEXT_NAME,
                    contextId: '',
                    basic: {
                        addLevel: false,
                        buildingName: 'Building',
                        selectedModel: '',
                    },
                    levelSelect: [
                        { key: '/^Category$/', value: '/^Revit Level$/', isCat: true },
                    ],
                    roomSelect: [
                        { key: '/^Category$/', value: '/^Revit Pièces$/', isCat: true },
                    ],
                    structureSelect: [
                        { key: '/^Category$/', value: '/^Revit Murs$/', isCat: true },
                        { key: '/^Category$/', value: '/^Revit Portes$/', isCat: true },
                        {
                            key: '/^Category$/',
                            value: '/^Revit Garde-corps$/',
                            isCat: true,
                        },
                        { key: '/^Category$/', value: '/^Revit Fenêtres$/', isCat: true },
                        { key: '/^Category$/', value: '/^Revit Walls$/', isCat: true },
                        { key: '/^Category$/', value: '/^Revit Doors$/', isCat: true },
                        { key: '/^Category$/', value: '/^Revit Railings$/', isCat: true },
                        { key: '/^Category$/', value: '/^Revit Windows$/', isCat: true },
                    ],
                    floorRoomNbr: 'Number',
                    floorSelect: [
                        { key: '/^Nom du type$/', value: '/^Finition de sol$/' },
                    ],
                },
            ],
        });
    }
    saveConfig(config) {
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            if (item.configName.get() === config.configName) {
                const contextId = item.contextId;
                const contextName = item.contextName;
                const archi = item.archi;
                item.set(config);
                if (contextId)
                    item.mod_attr('contextId', contextId);
                if (contextName)
                    item.mod_attr('contextName', contextName);
                if (archi)
                    item.mod_attr('archi', archi);
            }
        }
    }
    getConfig(configName) {
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            if (item.configName.get() === configName) {
                return item;
            }
        }
    }
    getConfigFromContextId(contextId) {
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            if (item.contextId.get() === contextId) {
                return item;
            }
        }
    }
}
exports.SpatialConfig = SpatialConfig;
spinal_core_connectorjs_type_1.default.register_models(SpatialConfig);
//# sourceMappingURL=SpatialConfig.js.map