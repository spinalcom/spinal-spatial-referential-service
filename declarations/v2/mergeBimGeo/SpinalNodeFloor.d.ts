import type { SpinalNode, SpinalNodeInfoModel } from 'spinal-model-graph';
import type { Lst, Model, Str } from 'spinal-core-connectorjs';
export interface IlinkedBimGeosModel extends Model {
    contextId: Str;
    floorId: Str;
}
export interface SpinalNodeFloor extends SpinalNode {
    info: SpinalNodeInfoModel & {
        linkedBimGeos?: Lst<IlinkedBimGeosModel>;
    };
}
