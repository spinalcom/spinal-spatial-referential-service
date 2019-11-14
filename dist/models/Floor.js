"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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