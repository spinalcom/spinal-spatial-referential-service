import { SpatialManager } from "./SpatialManager";
declare const _default: {
    config: {
        batchSize: number;
        contextName: string;
        buildingName: string;
        attrs: {
            room: {
                attrName: string;
                attrVal: string;
            };
            level: {
                attrName: string;
                attrVal: string;
            };
            floors: {
                attrName: string;
                attrVal: string;
            };
        };
        roomNiveau: string;
        props: {
            room: {};
            level: {
                'components': {
                    type: string;
                };
            };
            floors: {};
        };
    };
    SpatialManager: typeof SpatialManager;
};
export default _default;
