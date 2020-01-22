import { Model } from "spinal-core-connectorjs_type";
interface RevitAttributesObj extends spinal.Model {
    attrName: spinal.Str;
    attrVal: spinal.Str;
}
export interface RevitAttributes extends spinal.Model {
    room: RevitAttributesObj;
    level: RevitAttributesObj;
    floors: RevitAttributesObj;
}
export interface ObjectProperties extends spinal.Model {
    room: spinal.Lst<spinal.Str>;
    level: spinal.Lst<spinal.Str>;
    floor: spinal.Lst<spinal.Str>;
}
export declare class SpatialConfig extends Model {
    contextName: string;
    buildingName: string[];
    revitAttribute: RevitAttributes;
    objectProperties: ObjectProperties;
    constructor();
}
export {};
