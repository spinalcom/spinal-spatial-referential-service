/// <reference types="forge-viewer" />
import Model = Autodesk.Viewing.Model;
import { SpinalContext, SpinalNode, SpinalNodeRef } from "spinal-env-viewer-graph-service";
import { SpatialConfig, IMConfigArchi } from "./models/SpatialConfig";
interface ComparisionObject {
    deleted: {
        levels: {
            [externalId: string]: Level;
        };
        rooms: {
            [externalId: string]: CmpRoom;
        };
    };
    updated: {
        levels: {
            [externalId: string]: Level;
        };
        rooms: {
            [externalId: string]: CmpRoom;
        };
    };
    new: {
        levels: {
            [externalId: string]: Level;
        };
        rooms: {
            [externalId: string]: Room[];
        };
    };
}
export declare type CmpRoom = {
    levelId: string;
    room: Room;
};
export interface ModelArchi {
    [dbId: string]: Level;
}
export declare type LevelRooms = {
    [externalId: string]: Room;
};
export declare type LevelStructures = {
    [externalId: string]: Structure;
};
export interface Level {
    properties: Properties;
    children: LevelRooms;
    structures: LevelStructures;
}
export interface Room {
    properties: Properties;
    children: Structure[];
}
export interface Structure {
    properties: Properties;
}
export interface Properties {
    dbId: number;
    externalId: string;
    properties: SpinalProps[];
}
export interface SpinalProps {
    name: string;
    value: any;
    [type: string]: any;
}
export declare class SpatialManager {
    private spatialConfig;
    private buildingManager;
    private floorManager;
    private roomManager;
    private initialized;
    private model;
    private modelArchi;
    private modelArchiLib;
    constructor();
    init(): Promise<any>;
    generateContext(configName: string, model: Model): Promise<void>;
    addRoomValueParam(target: SpinalProps[], other: Room): void;
    addIfExist(array: Room[], room: Room): boolean;
    getRoomName(room: Room): string;
    createRooms(rooms: LevelRooms, contextId: string, floorId: string, model: Model): Promise<void>;
    /**
     * Waits for the nodes to be in the FileSystem.
     * @param {Array<Promise>} promises Array of promises containing the nodes
     * @returns {Promise<any>} An empty promise
     */
    waitForFileSystem(promises: Promise<any>[]): Promise<any[]>;
    addReferenceObject(dbId: number, name: string, model: Model, targetNode: SpinalNode<any>, relationName?: any): Promise<SpinalNode<any>>;
    private addRefStructureToLevel;
    private addRefStructureToRoom;
    createFloor(contextId: string, buildingId: string, name: string, level: Level, model: Model): Promise<void>;
    updateContext(configName: string, model: Model): Promise<void>;
    /**
     * remove $room from the floor, the .room context and at it to the invalid
     * context
     * @param room
     */
    removeRoom(levelRef: SpinalNodeRef, roomRef: SpinalNodeRef): Promise<void>;
    addToInvalidContext(id: string): Promise<boolean>;
    getFloorFromRoom(room: any): Promise<void>;
    private updateLevel;
    private updateRoom;
    createRoomObj(levelId: string, room: Room): {
        levelId: string;
        room: Room;
    };
    compareArchi(oldArchi: ModelArchi, newArchi: ModelArchi): ComparisionObject;
    private static getContext;
    getSpatialConfig(): Promise<SpatialConfig>;
    /**
     * use propertyDb to create a representation of the architecture of the model
     * @private
     * @param {Model} model
     * @returns {Promise<ModelArchi>}
     * @memberof SpatialManager
     */
    private getArchiModel;
    private findLevel;
    private findRoom;
    getContextFromConfig(config: IMConfigArchi): Promise<SpinalContext<any>>;
    private getBuilding;
    getFloorFinish(configName: string, model: Model): Promise<Structure[]>;
    getRoomIdFromDbId(externalId: string): Promise<any>;
    getRoomIdFromFloorFinish(floorId: number): string;
    getFloorFinishId(configName: string, model: Model): Promise<number[]>;
}
export {};
