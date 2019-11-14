import { Model } from "spinal-core-connectorjs_type";
export declare class Floor extends Model {
    displayName: string;
    level: number;
    z_index: number;
    constructor(displayName: string, level: number, z_index: number);
    getPropertyNamed(props: any, name: any): any;
}
