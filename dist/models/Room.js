"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
class Room extends spinal_core_connectorjs_type_1.Model {
    constructor(props) {
        super();
        this.add_attr({
            name: props.name,
            externalId: props.externalId,
            dbId: props.dbId,
            number: this.getPropertyNamed(props.properties, 'number'),
            local: this.getPropertyNamed(props.properties, 'local'),
            floors: this.getPropertyNamed(props.properties, 'etage'),
            area: this.getPropertyNamed(props.properties, 'area'),
            perimeter: this.getPropertyNamed(props.properties, 'perimeter'),
            volume: this.getPropertyNamed(props.properties, 'volume')
        });
    }
    getPropertyNamed(props, name) {
        for (let i = 0; i < props.length; i++) {
            if (props[i].attributeName.toLowerCase() === name)
                return props[i].displayValue;
        }
        return undefined;
    }
}
exports.Room = Room;
//# sourceMappingURL=Room.js.map