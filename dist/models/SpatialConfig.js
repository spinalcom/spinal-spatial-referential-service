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
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const ROOM_ATTRIBUTE_NAME = 'category';
const ROOM_ATTRIBUTE_VALUE = 'Revit Pièces';
const LEVEL_ATTRIBUTE_NAME = 'category';
const LEVEL_ATTRIBUTE_VALUE = 'Revit Level';
const FLOOR_ATTRIBUTE_NAME = 'SCtype';
const FLOOR_ATTRIBUTE_VALUE = 'Floor_finish';
const ROOM_PROPERTIES = ['area', 'volume', 'perimeter', 'local', 'etage', 'stype', 'roomid', 'number'];
const FLOOR_PROPERTIES = [];
const LEVEL_PROPERTIES = ['roomid'];
const DEFAULT_BUILDINGS_NAME = ['Default building name'];
const CONTEXT_NAME = 'spatial';
class SpatialConfig extends spinal_core_connectorjs_type_1.Model {
    constructor() {
        super();
        this.add_attr({
            'contextName': CONTEXT_NAME,
            'buildingName': DEFAULT_BUILDINGS_NAME,
            'revitAttribute': {
                room: {
                    attrName: 'category',
                    attrVal: 'Revit Pièces',
                    attrCat: 'Level',
                },
                level: {
                    attrName: 'category',
                    attrVal: 'Revit Level',
                },
                floors: {
                    attrName: 'SCtype',
                    attrVal: 'Floor_finish'
                }
            },
            'objectProperties': {
                room: ['area', 'volume', 'perimeter', 'local', 'etage', 'stype', 'roomid', 'number'],
                level: ['elevation'],
                floors: ['roomid']
            },
            'archi': {}
        });
    }
}
exports.SpatialConfig = SpatialConfig;
//# sourceMappingURL=SpatialConfig.js.map