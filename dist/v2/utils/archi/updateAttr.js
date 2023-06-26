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
exports.updateAttr = void 0;
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
function updateAttr(node, attrs) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!attrs || (attrs && attrs.length === 0))
            return; // skip if nothing to update
        let cat = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getCategoryByName(node, 'Spatial');
        if (!cat) {
            cat = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.addCategoryAttribute(node, 'Spatial');
        }
        const attrsFromNode = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getAttributesByCategory(node, cat);
        for (const attr of attrs) {
            const attrFromNode = attrsFromNode.find((itm) => itm.label.get() === attr.label);
            if (attrFromNode) {
                try {
                    if (attrFromNode.value instanceof spinal_core_connectorjs_1.Val) {
                        attrFromNode.mod_attr('value', attr.value);
                    }
                    else {
                        attrFromNode.value.set(attr.value);
                    }
                }
                catch (error) {
                    console.error(error);
                    console.log('err', node, {
                        label: attrFromNode.label,
                        value: attr.value,
                    });
                }
                if (attr.unit)
                    attrFromNode.unit.set(attr.unit);
            }
            else {
                spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategory(node, cat, attr.label, attr.value.toString(), '', attr.unit);
            }
        }
    });
}
exports.updateAttr = updateAttr;
//# sourceMappingURL=updateAttr.js.map