import { Model } from "spinal-core-connectorjs_type";
export interface IMBasic extends spinal.Model {
    addLevel: spinal.Bool;
    buildingName: spinal.Str;
    selectedModel: spinal.Str;
}
export interface IMArchiSelect extends spinal.Model {
    key: spinal.Str;
    value: spinal.Str;
    isCat?: spinal.Bool;
}
export interface IMConfigArchi extends spinal.Model {
    configName: spinal.Str;
    contextName: spinal.Str;
    contextId: spinal.Str;
    basic: IMBasic;
    levelSelect: IMArchiSelect[];
    roomSelect: IMArchiSelect[];
    structureSelect: IMArchiSelect[];
    floorSelect?: IMArchiSelect[];
    floorRoomNbr: spinal.Str;
    floorRoomName?: spinal.Str;
    floorLevelName?: spinal.Str;
}
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
export interface ConfigArchi {
    configName: string;
    contextName: string;
    contextId: string;
    basic: Basic;
    levelSelect: ArchiSelect[];
    roomSelect: ArchiSelect[];
    structureSelect: ArchiSelect[];
    floorSelect?: ArchiSelect[];
    floorRoomNbr: string;
    floorRoomName?: string;
    floorLevelName?: string;
    archi?: any;
}
export declare class SpatialConfig extends Model {
    data: spinal.Lst<IMConfigArchi>;
    constructor();
    saveConfig(config: ConfigArchi): void;
    getConfig(configName: string): IMConfigArchi;
    getConfigFromContextId(contextId: string): IMConfigArchi;
}
