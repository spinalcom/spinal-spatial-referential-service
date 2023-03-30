export interface ComparisionObject {
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
export type CmpRoom = {
    levelId: string;
    room: Room;
};
export interface ModelArchi {
    [dbId: string]: Level;
}
export type LevelRooms = {
    [externalId: string]: Room;
};
export type LevelStructures = {
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
