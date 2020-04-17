export interface Basic {
    addLevel: boolean;
    buildingName: string;
    selectedModel: string;
}
export interface ArchiSelect {
    key: string;
    value: string;
    isCat?: boolean;
}
export interface ConfigGetArchi {
    basic: Basic;
    levelSelect: ArchiSelect[];
    roomSelect: ArchiSelect[];
    structureSelect: ArchiSelect[];
    floorSelect?: ArchiSelect[];
    floorRoomNbr: string;
    floorRoomName?: string;
    floorLevelName?: string;
}
export default function createFctGetArchi(config: ConfigGetArchi): string;
