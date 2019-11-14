/// <reference types="forge-viewer" />
import Model = Autodesk.Viewing.Model;
interface ComparisionObject {
    deleted: {
        levels: object;
        rooms: object;
    };
    updated: {
        levels: object;
        rooms: object;
    };
    new: {
        levels: object;
        rooms: object;
    };
}
export interface ModelArchi {
    [dbId: string]: Level;
}
export interface Level {
    properties: Properties;
    children: {
        [externalId: string]: Room;
    };
}
export interface Room {
    properties: Properties;
    child: Properties;
}
export interface Properties {
    dbId: number;
    externalId: string;
    properties: SpinalProps[];
}
export interface SpinalProps {
    name: string;
    value: any;
}
export declare class SpatialManager {
    private context;
    private contextId;
    private spatialConfig;
    private buildingManager;
    private floorManager;
    private roomManager;
    private initialized;
    private model;
    private modelArchi;
    constructor();
    init(): Promise<any>;
    generateContext(buildingName: string, model: Model): Promise<void>;
    createRooms(rooms: any, contextId: any, floorId: any, model: any): Promise<void>;
    /**
     * Waits for the nodes to be in the FileSystem.
     * @param {Array<Promise>} promises Array of promises containing the nodes
     * @returns {Promise<any>} An empty promise
     */
    waitForFileSystem(promises: any): Promise<any[]>;
    createFloor(contextId: any, buildingId: any, name: any, level: any, model: any): any;
    updateContext(buildingName: string, model: Model): Promise<void>;
    /**
     * remove $room from the floor, the .room context and at it to the invalid
     * context
     * @param room
     */
    removeRoom(room: any): Promise<unknown>;
    addToInvalidContext(id: any): Promise<boolean>;
    getFloorFromRoom(room: any): Promise<any>;
    private updateLevel;
    private updateRoom;
    compareArchi(oldArchi: object, newArchi: object): ComparisionObject;
    private static getContext;
    private getSpatialConfig;
    /**
     * use propertyDb to create a representation of the architecture of the model
     * @param model
     */
    private getArchiModel;
    private findLevel;
    private getBuilding;
    getFloorFinish(model: any): Promise<Properties[]>;
    getRoomIdFromDbId(externalId: string): Promise<any>;
    getRoomIdFromFloorFinish(floorId: any): string;
    getFloorFinishId(model: any): Promise<number[]>;
}
export {};
