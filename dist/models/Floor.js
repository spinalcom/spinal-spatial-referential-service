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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Floor = void 0;
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
class Floor extends spinal_core_connectorjs_type_1.Model {
    constructor(displayName, level, z_index) {
        super();
        this.add_attr({
            displayName: displayName,
            level: level,
            z_index: z_index
        });
    }
    getPropertyNamed(props, name) {
        for (let i = 0; i < props.length; i++) {
            if (props[i].attributeName.toLowerCase() === name)
                return props[i];
        }
        return undefined;
    }
}
exports.Floor = Floor;
//# sourceMappingURL=Floor.js.map