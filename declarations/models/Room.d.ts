import { Model } from 'spinal-core-connectorjs_type';
export declare class Room extends Model {
    name: string;
    externalId: string;
    dbId: number;
    number?: number;
    local?: string;
    floor?: number;
    area?: number;
    perimeter?: number;
    volume?: number;
    [key: string]: any;
    constructor(props: any);
    getPropertyNamed(props: any, name: any): any;
}
