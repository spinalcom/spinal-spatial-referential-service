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
            room: string[];
            level: {
                'components': {
                    type: string;
                };
            };
            floors: string[];
        };
    };
    SpatialManager: typeof SpatialManager;
};
export default _default;
import './test';
