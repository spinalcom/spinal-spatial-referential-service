import { Model } from "spinal-core-connectorjs_type";
export interface RevitAttributes {
    room: {
        attrName: string;
        attrVal: string;
    };
    level: {
        attrName: string;
        attrVal: string;
    };
    floor: {
        attrName: string;
        attrVal: string;
    };
}
export interface ObjectProperties {
    room: string[];
    level: string[];
    floor: string[];
}
export declare class SpatialConfig extends Model {
    contextName: string;
    buildingName: string[];
    revitAttribute: RevitAttributes;
    objectProperties: ObjectProperties;
    constructor();
}
