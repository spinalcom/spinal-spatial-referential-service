"use strict";
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
const CONTEXT_NAME = 'Spatial';
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